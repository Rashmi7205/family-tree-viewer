import { Button } from "@/components/ui/button";
import { Download, RotateCcw, HelpCircle } from "lucide-react";
import { FC, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onExportPNG?: () => void;
  onExportSVG?: () => void;
  onResetView: () => void;
}

export const Header: FC<HeaderProps> = ({
  onExportPNG,
  onExportSVG,
  onResetView,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push("/auth/signin");
  };
  return (
    <header className="absolute top-0 left-0 right-0 z-10 px-2 sm:px-4 pt-2 pb-1 sm:pt-4 sm:pb-2">
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-lg shadow-sm px-2 sm:px-4 py-2 sm:py-3">
        <h1 className="text-lg sm:text-2xl font-bold">Family Tree Viewer</h1>
        <div className="flex items-center gap-1 sm:gap-2">
          {onExportPNG && onExportSVG && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-20 sm:h-10 sm:w-24 text-xs sm:text-sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="Export diagram"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-50 min-w-[120px]">
                  <button
                    className="w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      onExportPNG();
                      setShowExportMenu(false);
                    }}
                  >
                    <Download className="h-3 w-3" />
                    Export as PNG
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      onExportSVG();
                      setShowExportMenu(false);
                    }}
                  >
                    <Download className="h-3 w-3" />
                    Export as SVG
                  </button>
                </div>
              )}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-20 sm:h-10 sm:w-24 text-xs sm:text-sm"
            onClick={onResetView}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
          </Button>
          {/* User Profile Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.photoURL || userProfile?.photoURL || ""}
                      alt={
                        userProfile?.displayName || user?.displayName || "User"
                      }
                    />
                    <AvatarFallback>
                      {userProfile?.displayName?.charAt(0).toUpperCase() ||
                        user?.displayName?.charAt(0).toUpperCase() || (
                          <Icons.user className="h-5 w-5" />
                        )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile?.displayName || user?.displayName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground break-all">
                      {userProfile?.email || user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/user-profile")}
                  className="cursor-pointer"
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer"
                >
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-600 focus:text-red-700"
                >
                  <Icons.logOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* End User Profile Dropdown */}
        </div>
      </div>
    </header>
  );
};
