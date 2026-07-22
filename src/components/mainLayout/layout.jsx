import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react"; // Import the Globe icon
import BottomNavigation from "../BottomNavigation";

const MainLayout = ({ children, showSidebar }) => {
  const { i18n } = useTranslation();

  // Extracted function to change language
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    window.location.reload();
  };

  return (
    <div>
      {showSidebar && (
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full overflow-x-hidden overflow-y-auto p-1 min-h-screen bg-white main-content">
            <div className="flex justify-between items-center">
              <SidebarTrigger className="h-12 w-12 text-2xl border" />
              <div className="mr-4">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Globe className="w-6 h-6 text-black" /> {/* Add the Globe icon */}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleLanguageChange("am")}>
                      Amharic
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {children}
          </main>
          <BottomNavigation />
        </SidebarProvider>
      )}
      {!showSidebar && (
        <main className="w-full overflow-x-hidden overflow-y-auto bg-white">
          {children}
        </main>
      )}
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
