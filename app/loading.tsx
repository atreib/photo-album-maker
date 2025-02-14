import { Loader2Icon } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-[100dvh] h-[100dvh] flex items-center justify-center">
      <Loader2Icon className="w-10 h-10 animate-spin" />
    </div>
  );
}
