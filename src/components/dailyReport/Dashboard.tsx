import React, { useEffect, useState } from "react";
import styles from "@/styles/DailyReport.module.css";
import axios from "axios";
import { Session } from "next-auth";
import { Employee, RoomInfo, RoomMember } from "@prisma/client";
import RoomInfoCard from "./RoomInfoCard";

interface RoomInfoProps extends RoomInfo {
  roomMember: RoomMember[];
}

interface DailyReportAdminProps extends Employee {
  roomInfo: RoomInfoProps[];
}

export default function Dashboard({ session }: { session: Session }) {
  const [employeeList, setEmployeeList] = useState<DailyReportAdminProps[]>([]);
  const [msg, setMsg] = useState<JSX.Element>(<></>);

  useEffect(() => {
    const getInformations = async () => {
      await axios
        .get("/api/dailyReport/get/roomInfoOverview", {
          params: {
            employeeId: session?.employee?.id,
          },
        })
        .then((res) => {
          setEmployeeList(res.data);
        })
        .catch((err) => {
          console.error(err);
          setMsg(
            <div className={styles.errorMessage}>Error: {err.message}</div>
          );
        });
    };

    getInformations();
  }, [session?.employee?.id]);

  return (
    <div className={styles.adminyMainComponent}>
      {msg}
      <h3>ルーム情報</h3>
      <div className={styles.roomInfoListComponent}>
        {employeeList?.map(
          (dispEmployee: DailyReportAdminProps, index: number) => (
            <RoomInfoCard key={index} dispEmployee={dispEmployee} />
          )
        )}
      </div>
    </div>
  );
}
