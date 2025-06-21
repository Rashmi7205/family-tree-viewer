import React from "react";
import { Handle, Position } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";

const StyledCardNode = ({ data }: { data: any }) => {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-transparent border-0"
      />
      <Card
        className="p-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 shadow-xl rounded-xl border-0 w-[90vw] max-w-[260px] sm:w-[260px] cursor-pointer transition ring-0 hover:ring-4 hover:ring-indigo-300"
        onClick={data.onShowDetails}
      >
        <CardContent className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4">
          {/* Image/Avatar */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
              {data.profileImageUrl ? (
                <img
                  src={data.profileImageUrl}
                  alt={`${data.firstName} ${data.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl sm:text-3xl">
                  {data.firstName?.[0]}
                </span>
              )}
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="font-semibold text-white text-base sm:text-lg leading-tight">
              {data.firstName} {data.lastName}
            </div>
            <div className="text-xs sm:text-sm text-white/80 capitalize">
              {data.gender}
            </div>
            <div className="text-xs sm:text-sm text-white/60 mt-1">
              {data.birthDate
                ? new Date(data.birthDate).toLocaleDateString()
                : ""}
            </div>
          </div>
        </CardContent>
      </Card>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-transparent border-0"
      />
    </div>
  );
};

export default StyledCardNode;
