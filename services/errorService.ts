
import { RegionMode } from "../types";
import { WizardError } from "./geminiService";

export type ErrorCategory = 'network' | 'safety' | 'quota' | 'permission' | 'generic' | 'validation';

export interface AppError {
  category: ErrorCategory;
  message: string;
  originalError?: any;
}

const ERROR_MESSAGES: Record<ErrorCategory, Record<RegionMode, string>> = {
  network: {
    [RegionMode.WESTERN]: "Link lost. Check your internet connection.",
    [RegionMode.BADINAN]: "پەیوەندی نەما. هێلا ئینتەرنێتێ پشکنین بکە.",
    [RegionMode.SORANI]: "پەیوەندی نەما. هێڵی ئینتەرنێتەکەت بپشکنە.",
    [RegionMode.ARABIC]: "فقد الاتصال. يرجى التحقق من اتصال الإنترنت."
  },
  quota: {
    [RegionMode.WESTERN]: "The Wizard is currently handling too many requests. Please wait a few seconds and try again.",
    [RegionMode.BADINAN]: "جادووگەر مژوولە. داخوازى زۆرن، هیڤیە چەند چرکەکا چاڤەرێ بە و دووبارە هەول بدە.",
    [RegionMode.SORANI]: "جادووگەر سەرقاڵە. داواکاری زۆرە، تکایە چەند چرکەیەک چاوەڕێ بکە و دووبارە هەوڵ بدەرەوە.",
    [RegionMode.ARABIC]: "المعالج مشغول حالياً بمعالجة الكثير من الطلبات. يرجى الانتظار لبضع ثوان ثم المحاولة مرة أخرى."
  },
  safety: {
    [RegionMode.WESTERN]: "Safety Protocol Blocked. Request violates safety guidelines.",
    [RegionMode.BADINAN]: "پڕۆتۆکۆلا سلامەتیێ هاتە گرتن. داخوازى دژی رێنمایانە.",
    [RegionMode.SORANI]: "پڕۆتۆکۆڵی سەلامەتی گیرا. داواکارییەکە دژی ڕێنماییەکانە.",
    [RegionMode.ARABIC]: "تم حظر بروتوكول السلامة. الطلب ينتهك إرشادات السلامة."
  },
  permission: {
    [RegionMode.WESTERN]: "Access Denied. You don't have permission for this action.",
    [RegionMode.BADINAN]: "دەستهەلات نینە. تە مۆلەت نینە بۆ ڤێ کارى.",
    [RegionMode.SORANI]: "دەسەڵات نییە. تۆ مۆڵەتت نییە بۆ ئەم کارە.",
    [RegionMode.ARABIC]: "تم رفض الوصول. ليس لديك إذن لهذا الإجراء."
  },
  validation: {
    [RegionMode.WESTERN]: "Input invalid. Please provide more details or a clearer image.",
    [RegionMode.BADINAN]: "پێزانین نە دروستن. هیڤیە پتر روون بکە یان وێنەکا روونتر بدە.",
    [RegionMode.SORANI]: "زانیارییەکان ناڕاستن. تکایە زیاتر ڕوونی بکەرەوە یان وێنەیەکی ڕوونتر بدە.",
    [RegionMode.ARABIC]: "البيانات غير صالحة. يرجى تقديم مزيد من التفاصيل أو صورة أوضح."
  },
  generic: {
    [RegionMode.WESTERN]: "Internal system fault. The Wizard is recalibrating.",
    [RegionMode.BADINAN]: "خەلەتیەکا ناڤخۆیی. جادووگەر یێ خۆ رێک دئێخیتەڤە.",
    [RegionMode.SORANI]: "هەڵەیەکی ناوخۆیی. جادووگەر خەریکی ڕێکخستنەوەی خۆیەتی.",
    [RegionMode.ARABIC]: "خطأ داخلي في النظام. المعالج يقوم بإعادة المعايرة."
  }
};

export function formatAppError(error: any, mode: RegionMode): { category: ErrorCategory; message: string } {
  let category: ErrorCategory = 'generic';

  if (error instanceof WizardError) {
    category = error.category as ErrorCategory;
  } else if (error?.message?.includes('permission-denied') || error?.message?.includes('PERMISSION_DENIED')) {
    category = 'permission';
  } else if (error?.message?.includes('quota') || error?.message?.includes('429') || error?.message?.includes('Rate limit')) {
    category = 'quota';
  } else if (error?.message?.includes('offline') || !navigator.onLine) {
    category = 'network';
  } else if (error?.message?.includes('safety') || error?.message?.includes('SAFETY')) {
    category = 'safety';
  }

  return {
    category,
    message: ERROR_MESSAGES[category][mode] || ERROR_MESSAGES.generic[mode]
  };
}
