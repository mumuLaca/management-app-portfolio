import {
  ApprovalStatusDailyReport,
  DailyReportAuthority,
  DailyReportType,
} from "@/lib/constants";
import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import ModalConfirm from "@/components/modal/ModalConfirm";
import { MODALMESSAGE } from "@/lib/modalMessage";
import styles from "@/styles/DailyReport.module.css";
import ModalBulkApproval from "./ModalBulkApproval";
import type { DailyReportCommonUrlParams } from "@/types/types";

type Props = {
  approvalStatus: string; // 承認ステータス
  authority: string; // 権限
  changeFlg: boolean; // 変更フラグ
  urlParams: DailyReportCommonUrlParams; // URLパラメータ
  handleSubmitted: (approvalStatus: string) => void; // 提出処理
  handleUpdateApproval: (approvalStatus: string) => void; // 承認処理
  handleBulkUpdateComplete: () => Promise<void>; // 日報データ更新フラグ
};

/**
 * @description
 * 承認ボタンコンポーネント
 */
export default function ApprovalButton({
  approvalStatus,
  authority,
  changeFlg,
  urlParams,
  handleSubmitted,
  handleUpdateApproval,
  handleBulkUpdateComplete,
}: Props) {
  const [modalShow, setModalShow] = useState(false);
  const [modalRevertShow, setModalRevertShow] = useState(false);
  const [modalSAOpenFlg, setModalSAOpenFlg] = useState(false); // 範囲承認モーダルのオープンフラグ
  const [changeApprovalStatus, setChangeApprovalStatus] = useState<string>(""); // 承認ステータス

  const { dailyReportType } = urlParams as DailyReportCommonUrlParams; // URLパラメータ

  let button = <></>;

  switch (approvalStatus) {
    // 未入力, 一時保存中
    case ApprovalStatusDailyReport.noInput.code:
      // 権限によるボタン表示制御
      if (approvalStatus === ApprovalStatusDailyReport.noInput.code) {
        if (changeFlg) {
          button = (
            <Dropdown>
              <Dropdown.Toggle variant="secondary" disabled>
                {ApprovalStatusDailyReport.noInput.caption}
              </Dropdown.Toggle>
            </Dropdown>
          );
        } else {
          button = (
            <>
              <Dropdown>
                <Dropdown.Toggle variant="info">入力中</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setModalShow(true)}>
                    提出
                  </Dropdown.Item>
                  {dailyReportType === DailyReportType.daily.code && (
                    <Dropdown.Item
                      onClick={() => {
                        setChangeApprovalStatus(
                          ApprovalStatusDailyReport.submitted.code
                        );
                        setModalSAOpenFlg(true);
                      }}
                    >
                      一括提出
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <ModalConfirm
                modalMessage={MODALMESSAGE.MM00501}
                show={modalShow}
                setModalShow={setModalShow}
                executeFunction={() =>
                  handleSubmitted(ApprovalStatusDailyReport.submitted.code)
                }
              />
            </>
          );
        }
      } else {
        button = <></>;
      }
      break;
    case ApprovalStatusDailyReport.saveTemporary.code:
      // 権限によるボタン表示制御
      switch (authority) {
        case DailyReportAuthority.mySelf.code:
          button = (
            <>
              <Dropdown>
                <Dropdown.Toggle variant="info">
                  {ApprovalStatusDailyReport.saveTemporary.caption}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setModalShow(true)}>
                    提出
                  </Dropdown.Item>
                  {dailyReportType === DailyReportType.daily.code && (
                    <Dropdown.Item
                      onClick={() => {
                        setChangeApprovalStatus(
                          ApprovalStatusDailyReport.submitted.code
                        );
                        setModalSAOpenFlg(true);
                      }}
                    >
                      一括提出
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <ModalConfirm
                modalMessage={MODALMESSAGE.MM00501}
                show={modalShow}
                setModalShow={setModalShow}
                executeFunction={() =>
                  handleSubmitted(ApprovalStatusDailyReport.submitted.code)
                }
              />
            </>
          );
          break;
        default:
          button = <></>;
      }
      break;
    // 提出済
    case ApprovalStatusDailyReport.submitted.code:
      // 権限によるボタン表示制御
      switch (authority) {
        // 自身
        case DailyReportAuthority.mySelf.code:
          button = (
            <Dropdown>
              <Dropdown.Toggle
                className={`${styles.statusBgSubmited} text-dark`}
              >
                {ApprovalStatusDailyReport.submitted.next}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() =>
                    handleUpdateApproval(
                      ApprovalStatusDailyReport.saveTemporary.code
                    )
                  }
                >
                  入力訂正
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          );
          break;
        // 育成担当
        case DailyReportAuthority.trainer.code:
          button = (
            <>
              <Dropdown>
                <Dropdown.Toggle className={styles.statusBgSubmited}>
                  {ApprovalStatusDailyReport.submitted.next}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setModalShow(true)}>
                    承認
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setModalRevertShow(true)}>
                    差戻し
                  </Dropdown.Item>
                  {dailyReportType === DailyReportType.daily.code && (
                    <Dropdown.Item
                      onClick={() => {
                        setChangeApprovalStatus(
                          ApprovalStatusDailyReport.firstApproval.code
                        );
                        setModalSAOpenFlg(true);
                      }}
                    >
                      一括承認
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <ModalConfirm
                modalMessage={MODALMESSAGE.MM00502}
                show={modalShow}
                setModalShow={setModalShow}
                executeFunction={() =>
                  handleUpdateApproval(
                    ApprovalStatusDailyReport.firstApproval.code
                  )
                }
              />
              <ModalConfirm
                modalMessage={MODALMESSAGE.MM00504}
                show={modalRevertShow}
                setModalShow={setModalRevertShow}
                executeFunction={() =>
                  handleUpdateApproval(
                    ApprovalStatusDailyReport.firstPending.code
                  )
                }
              />
            </>
          );
          break;
        // 本社担当
        case DailyReportAuthority.officeStaff.code:
          button = (
            <Dropdown>
              <Dropdown.Toggle className={styles.statusBgSubmited} disabled>
                {ApprovalStatusDailyReport.submitted.next}
              </Dropdown.Toggle>
            </Dropdown>
          );
          break;
      }
      break;
    // 育成担当承認済
    case ApprovalStatusDailyReport.firstApproval.code:
      // 権限によるボタン表示制御
      switch (authority) {
        // 自身
        case DailyReportAuthority.mySelf.code:
          button = (
            <Dropdown>
              <Dropdown.Toggle
                className={styles.statusBgTrainingPersonApproval}
                disabled
              >
                {ApprovalStatusDailyReport.firstApproval.caption}
              </Dropdown.Toggle>
            </Dropdown>
          );
          break;
        // 育成担当
        case DailyReportAuthority.trainer.code:
          button = (
            <>
              <Dropdown>
                <Dropdown.Toggle
                  className={styles.statusBgTrainingPersonApproval}
                >
                  {ApprovalStatusDailyReport.firstApproval.caption}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setModalRevertShow(true)}>
                    差戻し
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <ModalConfirm
                modalMessage={MODALMESSAGE.MM00504}
                show={modalRevertShow}
                setModalShow={setModalRevertShow}
                executeFunction={() =>
                  handleUpdateApproval(
                    ApprovalStatusDailyReport.firstPending.code
                  )
                }
              />
            </>
          );
          break;
        // 本社担当
        case DailyReportAuthority.officeStaff.code:
          button = (
            <>
              <Dropdown>
                <Dropdown.Toggle
                  className={styles.statusBgTrainingPersonApproval}
                >
                  {ApprovalStatusDailyReport.firstApproval.next}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setModalShow(true)}>
                    承認
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setModalRevertShow(true)}>
                    差戻し
                  </Dropdown.Item>
                  {dailyReportType === DailyReportType.daily.code && (
                    <Dropdown.Item
                      onClick={() => {
                        setChangeApprovalStatus(
                          ApprovalStatusDailyReport.secondApproval.code
                        );
                        setModalSAOpenFlg(true);
                      }}
                    >
                      一括承認
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <ModalConfirm
                modalMessage={MODALMESSAGE.MM00503}
                show={modalShow}
                setModalShow={setModalShow}
                executeFunction={() =>
                  handleUpdateApproval(
                    ApprovalStatusDailyReport.secondApproval.code
                  )
                }
              />
              <ModalConfirm
                modalMessage={MODALMESSAGE.MM00504}
                show={modalRevertShow}
                setModalShow={setModalRevertShow}
                executeFunction={() =>
                  handleUpdateApproval(
                    ApprovalStatusDailyReport.secondPending.code
                  )
                }
              />
            </>
          );
          break;
      }
      break;
    // 本社承認済
    case ApprovalStatusDailyReport.secondApproval.code:
      // 権限によるボタン表示制御
      switch (authority) {
        // 自身, 育成担当
        case DailyReportAuthority.mySelf.code:
        case DailyReportAuthority.trainer.code:
          button = (
            <Dropdown>
              <Dropdown.Toggle
                className={styles.statusBgHeadOfficeApproval}
                disabled
              >
                {ApprovalStatusDailyReport.secondApproval.caption}
              </Dropdown.Toggle>
            </Dropdown>
          );
          break;
        // 本社担当
        case DailyReportAuthority.officeStaff.code:
          button = (
            <>
              <Dropdown>
                <Dropdown.Toggle className={styles.statusBgHeadOfficeApproval}>
                  {ApprovalStatusDailyReport.secondApproval.caption}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setModalRevertShow(true)}>
                    差戻し
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <ModalConfirm
                modalMessage={MODALMESSAGE.MM00504}
                show={modalRevertShow}
                setModalShow={setModalRevertShow}
                executeFunction={() =>
                  handleUpdateApproval(
                    ApprovalStatusDailyReport.secondPending.code
                  )
                }
              />
            </>
          );
          break;
      }
      break;
    // 育成担当差戻中
    case ApprovalStatusDailyReport.firstPending.code:
      // 権限によるボタン表示制御
      switch (authority) {
        // 自身
        case DailyReportAuthority.mySelf.code:
          button = (
            <>
              <Dropdown>
                <Dropdown.Toggle variant="warning">
                  {ApprovalStatusDailyReport.firstPending.caption}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setModalShow(true)}>
                    再提出
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <ModalConfirm
                modalMessage={MODALMESSAGE.MM00501}
                show={modalShow}
                setModalShow={setModalShow}
                executeFunction={() =>
                  handleSubmitted(ApprovalStatusDailyReport.submitted.code)
                }
              />
            </>
          );
          break;
        // 育成担当, 本社
        case DailyReportAuthority.trainer.code:
        case DailyReportAuthority.officeStaff.code:
          button = (
            <Dropdown>
              <Dropdown.Toggle variant="warning" disabled>
                {ApprovalStatusDailyReport.firstPending.caption}
              </Dropdown.Toggle>
            </Dropdown>
          );
          break;
      }
      break;
    // 本社差戻中
    case ApprovalStatusDailyReport.secondPending.code:
      // 権限によるボタン表示制御
      switch (authority) {
        // 自身
        case DailyReportAuthority.mySelf.code:
          button = (
            <>
              <Dropdown>
                <Dropdown.Toggle variant="warning">
                  {ApprovalStatusDailyReport.secondPending.caption}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setModalShow(true)}>
                    再提出
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <ModalConfirm
                modalMessage={MODALMESSAGE.MM00501}
                show={modalShow}
                setModalShow={setModalShow}
                executeFunction={() =>
                  handleSubmitted(ApprovalStatusDailyReport.firstApproval.code)
                }
              />
            </>
          );
          break;
        // 育成担当, 本社
        case DailyReportAuthority.trainer.code:
        case DailyReportAuthority.officeStaff.code:
          button = (
            <Dropdown>
              <Dropdown.Toggle variant="warning" disabled>
                {ApprovalStatusDailyReport.secondPending.caption}
              </Dropdown.Toggle>
            </Dropdown>
          );
          break;
      }
      break;
  }
  return (
    <>
      {button}
      <ModalBulkApproval
        changeApprovalStatus={changeApprovalStatus}
        urlParams={urlParams}
        modalSAOpenFlg={modalSAOpenFlg}
        setModalSAOpenFlg={setModalSAOpenFlg}
        handleBulkUpdateComplete={handleBulkUpdateComplete}
      />
    </>
  );
}
