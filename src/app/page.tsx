import Image from "next/image";
import { TextArea } from "./_components/textArea";

export default function Home() {
  return (
    <div className="flex items-center justify-center font-manrope">
      <div className="w-120 h-170 bg-white flex items-start justify-center shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.1)] rounded-2xl">
        <TextArea />
      </div>
    </div>
  );
}
