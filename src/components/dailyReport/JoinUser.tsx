import styles from "@/styles/DailyReport.module.css";
import { RoomMember } from "@prisma/client";
import { DailyReportAuthority } from "@/lib/constants";

interface Proprs {
  joinUsers: RoomMember[];
  setAddress: React.Dispatch<React.SetStateAction<number[]>>;
  mFormOpenFunction: () => void;
}

/**
 * @description
 * 日報参加者一覧を表示するコンポーネント
 */
export default function JoinUser({
  joinUsers,
  setAddress,
  mFormOpenFunction,
}: Proprs) {
  return (
    <>
      <div className={styles.joinUserArea}>
        <div className={styles.userList}>
          <div className={styles.userGridArea}>
            <span>記入者</span>
            <div className={styles.userGrid}>
              {joinUsers
                .filter(
                  (user) => user.authority === DailyReportAuthority.mySelf.code
                )
                .map((user, index) => (
                  <button
                    key={index}
                    className={styles.userCard}
                    onClick={() => {
                      setAddress([user.employeeId]);
                      mFormOpenFunction();
                    }}
                  >
                    <span className={styles.userName}>{user.employeeName}</span>
                  </button>
                ))}
            </div>
          </div>
          <div className={styles.userGridArea}>
            <span>育成担当</span>
            <div className={styles.userGrid}>
              {joinUsers
                .filter(
                  (user) => user.authority === DailyReportAuthority.trainer.code
                )
                .map((user, index) => (
                  <button
                    key={index}
                    className={styles.userCard}
                    onClick={() => {
                      setAddress([user.employeeId]);
                      mFormOpenFunction();
                    }}
                  >
                    <span className={styles.userName}>{user.employeeName}</span>
                  </button>
                ))}
            </div>
          </div>
          <div className={styles.userGridArea}>
            <span>承認</span>
            <div className={styles.userGrid}>
              {joinUsers
                .filter(
                  (user) =>
                    user.authority === DailyReportAuthority.officeStaff.code
                )
                .map((user, index) => (
                  <button
                    key={index}
                    className={styles.userCard}
                    onClick={() => {
                      setAddress([user.employeeId]);
                      mFormOpenFunction();
                    }}
                  >
                    <span className={styles.userName}>{user.employeeName}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
        <div className={styles.joinUserNote}>
          ※メンバー名をクリックすることでSlackメッセージを送ることができます。
        </div>
      </div>
    </>
  );
}
