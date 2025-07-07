import Dashboard from "@/components/dailyReport/Dashboard";
import { useSession } from "next-auth/react";
import { Spinner } from "react-bootstrap";

export default function DailyReportManage() {
  // セッション情報取得
  const { data: session, status: sessionStatus } = useSession();

  // データ取得中はローディング
  if (sessionStatus === "loading") {
    return (
      <div className="w-100 mt-5 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <div className="px-2 py-1">
      <Dashboard session={session!} />
    </div>
  );
}
