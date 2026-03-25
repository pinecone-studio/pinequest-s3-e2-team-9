"use client";

import { useState } from "react";
import { QuestionBankAddQuestionDialog } from "./question-bank-add-question-dialog";
import { QuestionBankDetailSection } from "./question-bank-detail-section";

export function QuestionBankDetailView({ bankId }: { bankId: string }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("Хичээл");

  return (
    <>
      <QuestionBankDetailSection
        bankId={bankId}
        onAddQuestion={() => setOpen(true)}
        onSubjectChange={setSubject}
      />
      <QuestionBankAddQuestionDialog
        bankId={bankId}
        open={open}
        subject={subject}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
