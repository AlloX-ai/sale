import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";
import {
  ALLOX_LOYALTY_CHECK_PATH,
  ALLOX_PRIVATE_SALE_PATH,
  usePrivateSaleAccess,
} from "../hooks/usePrivateSaleAccess";
import { LoyaltyCheckPage } from "../pages/LoyaltyCheckPage";

/** Guards /loyalty-check: connected + not eligible. Eligible users go to private sale. */
export function LoyaltyCheckRoute() {
  const { canAccess, accessResolved, showLoyaltyCheck } = usePrivateSaleAccess();

  if (!accessResolved) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (canAccess) {
    return <Navigate to={ALLOX_PRIVATE_SALE_PATH} replace />;
  }

  if (!showLoyaltyCheck) {
    return <Navigate to="/" replace />;
  }

  return <LoyaltyCheckPage />;
}

export { ALLOX_LOYALTY_CHECK_PATH };