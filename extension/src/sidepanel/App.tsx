import React, { useState, useEffect } from 'react';
import { AssistantStatus, ChatMessage, ActionResponse, ClaimAnalysisResult } from '../shared/types';
import { Header } from './components/Header';
import { PageCard } from './components/PageCard';
import { Chat } from './components/Chat';
import { BrowserTools } from './components/BrowserTools';
import { ProductivityPanel } from './components/ProductivityPanel';
import { WhatsAppPanel } from './components/WhatsAppPanel';
import { PrivacyPanel } from './components/PrivacyPanel';
import { ConfirmationModal } from './components/ConfirmationModal';

import { useTabState } from './hooks/useTabState';
import { useVoice } from './hooks/useVoice';
import { useFocusTimer } from './hooks/useFocusTimer';

import { ApiService } from '../services/api';
import { StorageService, UserSettings } from '../services/storage';

export default function App() {
  const [status, setStatus] = useState<AssistantStatus>('Ready');
  const [activeSection, setActiveSection] = useState<'chat' | 'tools' | 'productivity' | 'whatsapp' | 'privacy'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<ActionResponse | null>(null);

  const [whatsappReplyDraft, setWhatsappReplyDraft] = useState<string>('');
  const [claimAnalysisResult, setClaimAnalysisResult] = useState<ClaimAnalysisResult | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    micEnabled: true,
    whatsappIntegrationEnabled: true,
    pageContextEnabled: true,
    localHistoryEnabled: true,
    speakAnswers: false,
    language: 'en-IN'
  });
  const [isLoading, setIsLoading] = useState(false);

  const { activeTab, pageContext, whatsappContext, totalTabsCount, duplicateCount, isRestrictedPage, refreshTabState } = useTabState();
  const { isListening, startListening, stopListening, speakText } = useVoice();
  const { timerState, startTimer, pauseTimer, resumeTimer, stopTimer } = useFocusTimer();

  useEffect(() => {
    (async () => {
      const savedSettings = await StorageService.getSettings();
      setUserSettings(savedSettings);
      const history = await StorageService.getChatHistory();
      setMessages(history);
    })();
  }, []);

  useEffect(() => {
    if (isListening) {
      setStatus('Listening');
    } else if (isLoading) {
      setStatus('Thinking');
    } else {
      setStatus('Ready');
    }
  }, [isListening, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    await StorageService.saveChatMessage(userMsg);

    setIsLoading(true);
    setStatus('Thinking');

    try {
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'PROCESS_USER_COMMAND', text }, async (res) => {
          if (res && res.success && res.isLocal) {
            const data = res.data;
            const assistantContent = data.spokenResponse || data.executionResult?.message || `Executed local browser command: ${text}`;

            const botMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: assistantContent,
              timestamp: Date.now(),
              actionPayload: data
            };

            setMessages(prev => [...prev, botMsg]);
            await StorageService.saveChatMessage(botMsg);
            if (userSettings.speakAnswers && data.spokenResponse) {
              speakText(data.spokenResponse);
            }
            setIsLoading(false);
            setStatus('Ready');
            refreshTabState();
            return;
          }

          await processAiChat(text, newMessages);
        });
      } else {
        await processAiChat(text, newMessages);
      }
    } catch (err: any) {
      console.error('[App] Message processing error:', err);
      setStatus('Error');
      setIsLoading(false);
    }
  };

  const processAiChat = async (text: string, currentHistory: ChatMessage[]) => {
    try {
      const response = await ApiService.sendChat(
        text,
        userSettings.pageContextEnabled && pageContext ? pageContext : undefined
      );

      let content = response.answer || response.spokenResponse || 'Processing your request...';
      if (response.type === 'ACTION' && response.action) {
        content = `Action Proposed: ${response.action.name}. ${response.spokenResponse || ''}`;
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: Date.now(),
        actionPayload: response,
        summaryData: response.type === 'PAGE_SUMMARY' ? response : undefined
      };

      setMessages(prev => [...prev, botMsg]);
      await StorageService.saveChatMessage(botMsg);

      if (userSettings.speakAnswers && response.spokenResponse) {
        speakText(response.spokenResponse);
      }

      if (response.type === 'ACTION' && response.action && !response.requiresConfirmation) {
        await handleExecuteAction(response.action);
      } else if (response.requiresConfirmation) {
        setPendingConfirmation(response);
      }
    } catch (err) {
      console.warn('[App] AI Process error fallback:', err);
    } finally {
      setIsLoading(false);
      setStatus('Ready');
    }
  };

  const handleExecuteAction = async (action: any) => {
    setStatus('Executing');
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'EXECUTE_ACTION', action }, (res) => {
        refreshTabState();
        setStatus('Ready');
      });
    }
  };

  const handleConfirmAction = async (actionPayload: ActionResponse) => {
    if (actionPayload.action) {
      await handleExecuteAction(actionPayload.action);
    }
    setPendingConfirmation(null);
  };

  const handleSummarizePage = async () => {
    if (!pageContext || isRestrictedPage) return;
    setIsLoading(true);
    setStatus('Thinking');

    try {
      const result = await ApiService.summarizePage(pageContext);
      const summaryMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.summary,
        timestamp: Date.now(),
        summaryData: result
      };
      setMessages(prev => [...prev, summaryMsg]);
      await StorageService.saveChatMessage(summaryMsg);
      setActiveSection('chat');
    } finally {
      setIsLoading(false);
      setStatus('Ready');
    }
  };

  const handleExplainSelection = async () => {
    if (!pageContext?.selectedText) return;
    setIsLoading(true);
    setStatus('Thinking');

    try {
      const result = await ApiService.explainText(pageContext.selectedText, pageContext.title, pageContext.url);
      const msg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.explanation,
        timestamp: Date.now(),
        explanationData: result
      };
      setMessages(prev => [...prev, msg]);
      await StorageService.saveChatMessage(msg);
      setActiveSection('chat');
    } finally {
      setIsLoading(false);
      setStatus('Ready');
    }
  };

  const handleGenerateWhatsAppReply = async (tone: string, customInst?: string) => {
    const msgText = whatsappContext.latestMessage || 'Hlo Rohit, hackathon kaisa chal raha hai?';
    setIsLoading(true);
    try {
      const result = await ApiService.generateWhatsAppReply(msgText, whatsappContext.senderName, tone);
      setWhatsappReplyDraft(result.reply);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertWhatsAppReply = async (text: string, autoSend: boolean = false) => {
    if (!activeTab?.id) return;
    try {
      const res = await chrome.tabs.sendMessage(activeTab.id, {
        type: 'INSERT_WHATSAPP_REPLY',
        text,
        autoSend
      });
      if (res && res.success) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: autoSend ? `Typed and sent reply to WhatsApp: "${text}"` : `Typed reply into WhatsApp composer: "${text}"`,
            timestamp: Date.now()
          }
        ]);
      }
    } catch (err: any) {
      console.warn('[App] WhatsApp reply insertion warning:', err);
    }
  };

  const handleAnalyseClaim = async (text: string) => {
    setIsLoading(true);
    try {
      const result = await ApiService.analyseClaim(text);
      setClaimAnalysisResult(result);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    await StorageService.clearAllData();
    setMessages([]);
    alert('All local storage cleared!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Header
        status={status}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isWhatsAppActive={whatsappContext.isWhatsApp}
      />

      <main className="flex-1 p-3 space-y-3">
        {/* Active Page Card Banner */}
        {activeSection !== 'privacy' && (
          <PageCard
            pageContext={pageContext}
            isRestrictedPage={isRestrictedPage}
            onSummarize={handleSummarizePage}
            onExplainSelection={handleExplainSelection}
            onAskAboutPage={() => {
              setActiveSection('chat');
              handleSendMessage(`Tell me more about the content on this page: ${pageContext?.title}`);
            }}
            isLoading={isLoading}
          />
        )}

        {/* Dynamic Section Switcher */}
        {activeSection === 'chat' && (
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            isListening={isListening}
            onStartListening={() => startListening((text) => handleSendMessage(text), userSettings.language)}
            onStopListening={stopListening}
            onSpeak={(txt) => speakText(txt, userSettings.language)}
            onConfirmAction={handleConfirmAction}
            isLoading={isLoading}
          />
        )}

        {activeSection === 'tools' && (
          <BrowserTools
            totalTabsCount={totalTabsCount}
            duplicateCount={duplicateCount}
            onExecuteLocalAction={(actionName, params) => {
              if (actionName === 'CLOSE_DUPLICATE_TABS') {
                setPendingConfirmation({
                  type: 'ACTION',
                  action: { name: 'CLOSE_DUPLICATE_TABS' },
                  requiresConfirmation: true,
                  confirmationDetails: `Close ${duplicateCount} duplicate open tabs?`
                });
              } else {
                handleExecuteAction({ name: actionName, parameters: params });
              }
            }}
            isLoading={isLoading}
          />
        )}

        {activeSection === 'productivity' && (
          <ProductivityPanel
            timerState={timerState}
            onStartTimer={startTimer}
            onPauseTimer={pauseTimer}
            onResumeTimer={resumeTimer}
            onStopTimer={stopTimer}
            totalTabsCount={totalTabsCount}
          />
        )}

        {activeSection === 'whatsapp' && (
          <WhatsAppPanel
            whatsappContext={whatsappContext}
            onRefreshWhatsApp={refreshTabState}
            onGenerateReply={handleGenerateWhatsAppReply}
            onInsertReply={handleInsertWhatsAppReply}
            onAnalyseClaim={handleAnalyseClaim}
            replyDraft={whatsappReplyDraft}
            setReplyDraft={setWhatsappReplyDraft}
            claimResult={claimAnalysisResult}
            isLoading={isLoading}
          />
        )}

        {activeSection === 'privacy' && (
          <PrivacyPanel
            settings={userSettings}
            onUpdateSettings={async (newSet) => {
              const updated = await StorageService.saveSettings(newSet);
              setUserSettings(updated);
            }}
            onClearData={handleClearData}
          />
        )}
      </main>

      {/* Action Confirmation Modal */}
      <ConfirmationModal
        actionPayload={pendingConfirmation}
        onConfirm={() => {
          if (pendingConfirmation) handleConfirmAction(pendingConfirmation);
        }}
        onCancel={() => setPendingConfirmation(null)}
      />
    </div>
  );
}
