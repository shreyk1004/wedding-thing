import { WeddingInfo } from "@/types";
import { ProgressRing } from "./progress-ring";

interface WeddingHeaderProps {
  weddingInfo: WeddingInfo;
  completionPercentage: number;
}

export function WeddingHeader({ weddingInfo, completionPercentage }: WeddingHeaderProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-wrap justify-between gap-6 p-6 bg-gradient-to-r from-[#fef9f3] to-[#fdf8f0] rounded-2xl shadow-sm border border-[#f0ebe4]">
      <div className="flex min-w-72 flex-col gap-3">
        <h1 className="text-[#181511] tracking-tight text-[32px] font-bold leading-tight">
          {weddingInfo.bride} & {weddingInfo.groom}'s Wedding
        </h1>
        <p className="text-[#887863] text-lg font-medium leading-normal">
          {formatDate(weddingInfo.date)}
        </p>
        {weddingInfo.venue && (
          <p className="text-[#887863] text-sm font-normal leading-normal">
            📍 {weddingInfo.venue}
          </p>
        )}
      </div>
      <div className="flex items-center">
        <ProgressRing 
          progress={completionPercentage} 
          size={140}
          strokeWidth={10}
        />
      </div>
    </div>
  );
} 