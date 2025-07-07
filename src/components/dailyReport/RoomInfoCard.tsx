import React from "react";
import styles from "@/styles/DailyReport.module.css";
import { Employee, RoomInfo, RoomMember } from "@prisma/client";
import { DailyReportAuthority, DailyReportType } from "@/lib/constants";
import { getDailyReportTypeKey } from "@/utils/constantsUtil";
import { Button } from "react-bootstrap";
import { useRouter } from "next/router";
import dayjs from "dayjs";

interface RoomInfoProps extends RoomInfo {
  roomMember: RoomMember[];
}

interface DailyReportAdminProps {
  dispEmployee: Employee & {
    roomInfo: RoomInfoProps[];
  };
}

export default function RoomInfoCard({ dispEmployee }: DailyReportAdminProps) {
  const router = useRouter();
  return (
    <div className={styles.roomInfoCard}>
      <div className={styles.roomInfoCardDiv}>
        <h4>{dispEmployee.name}</h4>
        <h5>所属 : {dispEmployee.section}</h5>
      </div>
      <div className="d-flex flex-wrap align-items-center justify-content-end w-100">
        {dispEmployee.roomInfo.map((roomInfo: RoomInfoProps, index: number) => (
          <Button
            key={index}
            variant="primary"
            className={styles.roomInfoCardButton}
            onClick={() =>
              router.push(
                `/dailyReport/${roomInfo.roomId}/${
                  roomInfo.dailyReportType
                }/${dayjs(roomInfo.fromDate).format("YYYYMMDD")}/${dayjs(
                  roomInfo.toDate
                ).format("YYYYMMDD")}`
              )
            }
          >
            <h4 className="me-5">
              {
                DailyReportType[getDailyReportTypeKey(roomInfo.dailyReportType)]
                  .name
              }
            </h4>
            <div>
              <div className="d-flex flex-wrap justify-center">
                <span className="me-2">育成担当 :</span>
                <span className={styles.roomInfoTrainer}>
                  {roomInfo.roomMember
                    .filter(
                      (member: RoomMember) =>
                        member.authority === DailyReportAuthority.trainer.code
                    )
                    .map((member: RoomMember, index: number) => (
                      <span key={index}>
                        {member.employeeName.replace(/　/g, "")}
                      </span>
                    ))}
                </span>
              </div>
              <div className="d-flex flex-wrap justify-center">
                <span className="me-2">本部 :</span>
                <div className={styles.roomInfoTrainer}>
                  {roomInfo.roomMember
                    .filter(
                      (member: RoomMember) =>
                        member.authority ===
                        DailyReportAuthority.officeStaff.code
                    )
                    .map((member: RoomMember, index: number) => (
                      <span key={index}>
                        {member.employeeName.replace(/　/g, "")}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
