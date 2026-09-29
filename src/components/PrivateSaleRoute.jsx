import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";
import {
  ALLOX_LOYALTY_CHECK_PATH,
  ALLOX_PRIVATE_SALE_PATH,
  usePrivateSaleAccess,
} from "../hooks/usePrivateSaleAccess";
import { PublicSalePage } from "../pages/PublicSalePage";

/** Guards /private-sale: connected + whitelisted only. */
export function PrivateSaleRoute() {
  const { canAccess, accessResolved, showLoyaltyCheck } = usePrivateSaleAccess();

  if (!accessResolved) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (canAccess) {
    return <PublicSalePage />;
  }

  if (showLoyaltyCheck) {
    return <Navigate to={ALLOX_LOYALTY_CHECK_PATH} replace />;
  }

  return <Navigate to="/" replace />;
}

export { ALLOX_PRIVATE_SALE_PATH };