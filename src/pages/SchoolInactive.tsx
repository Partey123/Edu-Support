import { AlertCircle, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function SchoolInactivePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleActivate = () => {
    navigate("/school-admin/activate");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          School Access Restricted
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Your school's account is currently inactive. This may be due to:
        </p>

        <ul className="space-y-3 mb-8 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="text-red-600 mr-2">•</span>
            <span>School has not yet been activated</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-600 mr-2">•</span>
            <span>Subscription payment is overdue</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-600 mr-2">•</span>
            <span>Account suspension by administrator</span>
          </li>
        </ul>

        <div className="space-y-3">
          <Button
            onClick={handleActivate}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Zap className="h-4 w-4" />
            Activate School
          </Button>
          <Button
            onClick={handleLogout}
            variant="default"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open("https://edusupport.ghana", "_blank")}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
