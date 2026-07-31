import { Request, Response, NextFunction } from 'express';
import { GeminiService } from '../services/geminiService';
import {
  ChatRequestSchema,
  PageSummaryRequestSchema,
  ExplainTextRequestSchema,
  WhatsAppReplyRequestSchema,
  AnalyseClaimRequestSchema
} from '../schemas/requestSchemas';

const geminiService = new GeminiService();

export class AssistantController {
  static async handleChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = ChatRequestSchema.parse(req.body);
      const result = await geminiService.processChat(validatedData);
      res.json({ success: true, data: result, error: null });
    } catch (err) {
      next(err);
    }
  }

  static async handlePageSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = PageSummaryRequestSchema.parse(req.body);
      const result = await geminiService.summarizePage(validatedData);
      res.json({ success: true, data: result, error: null });
    } catch (err) {
      next(err);
    }
  }

  static async handleExplainText(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = ExplainTextRequestSchema.parse(req.body);
      const result = await geminiService.explainText(validatedData);
      res.json({ success: true, data: result, error: null });
    } catch (err) {
      next(err);
    }
  }

  static async handleWhatsAppReply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = WhatsAppReplyRequestSchema.parse(req.body);
      const result = await geminiService.generateWhatsAppReply(validatedData);
      res.json({ success: true, data: result, error: null });
    } catch (err) {
      next(err);
    }
  }

  static async handleAnalyseClaim(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = AnalyseClaimRequestSchema.parse(req.body);
      const result = await geminiService.analyseClaim(validatedData);
      res.json({ success: true, data: result, error: null });
    } catch (err) {
      next(err);
    }
  }
}
