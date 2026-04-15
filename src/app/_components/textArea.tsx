"use client";
import { Button } from "@/../../src/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/../../src/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/../../src/components/ui/input-group";
import { GoogleGenAI } from "@google/genai";
import { useState } from "react";

const genAI = new GoogleGenAI({
  apiKey: "hehe",
});

export function TextArea() {
  const [text, setText] = useState("");
  const [text1, setText1] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const onChange = (event: any) => setText(event.target.value);
  const onChangeArticle = (event: any) => setText1(event.target.value);

  async function generateText() {
    setLoading(true);
    setSaveStatus("idle");
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate 5 multiple choice questions based on this article: ${text}. Return the response in this exact JSON format:
      [
        {
          "question": "Question text here",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "answer": "0"
        }
      ]
      Make sure the response is valid JSON and the answer is the index (0-3) of the correct option.`,
      });

      const raw = response.text ?? "";
      setResult(raw);

      // Parse and save to DB
      setSaving(true);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const questions = JSON.parse(cleaned);

      const res = await fetch("/api/save-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: text1,
          content: text,
          questions,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      setSaveStatus("success");
    } catch (e) {
      console.error("Error:", e);
      setSaveStatus("error");
    } finally {
      setLoading(false);
      setSaving(false);
    }
  }

  return (
    <FieldGroup className="max-w-sm bg-white pt-10">
      <Field>
        <div className="flex flex-col gap-10 pb-10">
          <p className="font-bold text-2xl">Article Quiz Generator</p>
          <p>
            Paste your article content below to generate a summary and quiz
            questions. Your articles will be saved in the sidebar for future
            reference.
          </p>
        </div>
        <FieldLabel htmlFor="block-end-input">Article Title</FieldLabel>
        <InputGroup className="h-auto">
          <InputGroupInput
            id="block-end-input"
            placeholder="Enter title for your article..."
            onChange={onChangeArticle}
          />
          <InputGroupAddon align="block-end" />
        </InputGroup>
      </Field>
      <Field>
        <FieldLabel htmlFor="block-end-textarea">Article Content</FieldLabel>
        <InputGroup>
          <InputGroupTextarea
            id="block-end-textarea"
            placeholder="Paste article content here"
            className="h-50"
            onChange={onChange}
          />
        </InputGroup>
        <Button onClick={generateText} disabled={loading || saving}>
          {loading ? "Generating..." : saving ? "Saving..." : "Generate"}
        </Button>

        {saveStatus === "success" && (
          <p className="mt-2 text-sm text-green-600">
            ✓ Quiz saved successfully!
          </p>
        )}
        {saveStatus === "error" && (
          <p className="mt-2 text-sm text-red-500">
            ✗ Failed to save quiz. Please try again.
          </p>
        )}

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md whitespace-pre-wrap text-sm">
            {result}
          </div>
        )}
      </Field>
    </FieldGroup>
  );
}
