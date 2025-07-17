import { AbsentData, WorkStyle } from "@/lib/constants";
import axios from "axios";
import dayjs from "@/lib/dayjs";
import "flatpickr/dist/flatpickr.min.css";
import { Japanese } from "flatpickr/dist/l10n/ja.js";
import React, { Dispatch, JSX, SetStateAction } from "react";
import FlatPickr from "react-flatpickr";
import { KeyedMutator } from "swr";
import TimeList15 from "../common/TimeList15";
import { getAbsentDataKey, getWorkStyleKey } from "@/utils/constantsUtil";
import { MESSAGE } from "../../lib/message";
import { TypeMonthlyAttendance } from "@/types/attendance";
import { Employee } from "@prisma/client";
import { BsWrenchAdjustableCircle } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  show: boolean;
  setModalShow: Dispatch<SetStateAction<boolean>>;
  employee: Employee;
  attendanceData: TypeMonthlyAttendance;
  mutateAttendance: KeyedMutator<TypeMonthlyAttendance>;
};

/**
 * @description
 * 一括修正用モーダル
 */
export default function ModalAllModify({
  show,
  setModalShow,
  employee,
  attendanceData,
  mutateAttendance,
}: Props) {
  const { yearMonth, list } = attendanceData;

  const [targetDates, setTargetDates] = React.useState<Date[]>([]);
  const [startTime, setStartTime] = React.useState<string>(employee.startTime);
  const [endTime, setEndTime] = React.useState<string>(employee.endTime);
  const [rest, setRest] = React.useState<string>("1.00");
  const [workStyle, setWorkStyle] = React.useState<string>(
    WorkStyle[getWorkStyleKey(employee.basicWorkStyle)].code
  );
  const [absentCode, setAbsentCode] = React.useState<string>(
    AbsentData.none.code
  );
  const [note, setNote] = React.useState<string>("");

  const [identificationModify, setIdentificationModify] =
    React.useState<boolean>(false);
  const [startTimeModify, setStartTimeModify] = React.useState<boolean>(false);
  const [endTimeModify, setEndTimeModify] = React.useState<boolean>(false);
  const [restModify, setRestModify] = React.useState<boolean>(false);
  const [workStyleModify, setWorkStyleModify] = React.useState<boolean>(false);
  const [absentCodeModify, setAbsentCodeModify] =
    React.useState<boolean>(false);
  const [noteModify, setNoteModify] = React.useState<boolean>(false);

  const [alert, setAlert] = React.useState<JSX.Element>(<></>);
  const [dispAttention, setDispAttention] = React.useState<boolean>(false);

  const firstDayOfMonth = dayjs(`${yearMonth}01`).startOf("month").toDate();
  const lastDayOfMonth = dayjs(`${yearMonth}01`).endOf("month").toDate();
  const noEntryDates = [];
  const enteredAlldayFalseDates = list
    .filter((item) => !AbsentData[getAbsentDataKey(item.absentCode)].allday)
    .map((item) => dayjs(item.date).format("YYYY-MM-DD"));
  const enteredDates = attendanceData.list.map((item) =>
    dayjs(item.date).format("YYYY-MM-DD")
  );

  // 未登録日付の配列を作成
  for (
    let target = dayjs(`${yearMonth}01`).startOf("month");
    target <= dayjs(`${yearMonth}01`).endOf("month");
    target = target.add(1, "day")
  ) {
    if (!enteredAlldayFalseDates.includes(target.format("YYYY-MM-DD"))) {
      noEntryDates.push(target.format("YYYY-MM-DD"));
    }
  }

  // ModalDOMに対するWarningが発生する為、モーダル専用Propsを作成
  // モーダルクローズ時の挙動
  const onHide = () => {
    setModalShow(false);

    setTargetDates([]);
    setStartTime(employee.startTime);
    setEndTime(employee.endTime);
    setRest("1.00");
    setWorkStyle(WorkStyle[getWorkStyleKey(employee.basicWorkStyle)].code);
    setAbsentCode(AbsentData.none.code);
    setNote("");

    setIdentificationModify(false);
    setStartTimeModify(false);
    setEndTimeModify(false);
    setRestModify(false);
    setWorkStyleModify(false);
    setAbsentCodeModify(false);
    setNoteModify(false);
  };

  const hideElement = () => {
    setAlert(<></>);
  };

  // 一括修正
  const handleSubmit = async () => {
    const data = {
      id: employee.id,
      targetDate: !identificationModify
        ? enteredAlldayFalseDates
        : targetDates.map((value) => dayjs(value).format("YYYY-MM-DD")),
      startTime: startTimeModify ? startTime : "",
      endTime: endTimeModify ? endTime : "",
      rest: restModify ? rest : "",
      workStyle: workStyleModify ? workStyle : "",
      absentCode: absentCodeModify ? absentCode : "",
      note: noteModify ? note : "",
    };

    // 更新処理
    await axios
      .post("/api/attendance/update", data)
      .then(() => {
        // 表示の更新
        mutateAttendance();
        // モーダルをクローズ
        onHide();
      })
      .catch((err) => {
        setAlert(
          <Alert>
            <AlertDescription>{MESSAGE.EM00000.message}</AlertDescription>
          </Alert>
        );
        setTimeout(hideElement, 5000);
        console.error(err);
      });
  };

  // 一括削除
  const handleDelete = async () => {
    // 日付選択していない場合は登録済の日付全てが対象
    const data = {
      id: employee.id,
      targetDate: !identificationModify
        ? enteredDates
        : targetDates.map((value) => dayjs(value).format("YYYY-MM-DD")),
      deleteFlg: "1",
    };

    // 削除処理
    await axios.post("/api/attendance/entry", data);

    // 表示の更新
    mutateAttendance();
    // モーダルをクローズ
    onHide();
  };

  // 区分変更時
  const handleChangeaAbsent = (value: string) => {
    setAbsentCode(value);

    if (AbsentData[getAbsentDataKey(value)].allday) {
      setStartTime(employee.startTime);
      setEndTime(employee.endTime);
      setRest("1.00");
      setWorkStyle(WorkStyle[getWorkStyleKey(employee.basicWorkStyle)].code);

      setStartTimeModify(false);
      setEndTimeModify(false);
      setRestModify(false);
      setWorkStyleModify(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="bg-dark" style={{ color: "#fff" }}>
          <DialogTitle className="flex items-center">
            <BsWrenchAdjustableCircle />
            <span className="ms-2">一括修正</span>
          </DialogTitle>
        </DialogHeader>
        <div>{alert}</div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={identificationModify}
                onCheckedChange={() => {
                  setTargetDates([]);
                  setIdentificationModify(!identificationModify);
                }}
                id="identification-switch"
              />
              <Label htmlFor="identification-switch">
                特定の日付のみ修正する
              </Label>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDispAttention(!dispAttention)}
              className="px-2 py-1 rounded-full"
            >
              注意事項
            </Button>
          </div>
          {dispAttention && (
            <Alert>
              <AlertDescription>
                <div className="mb-2">
                  ・修正したい項目にチェックと値を入れてください。
                </div>
                <div className="mb-2">
                  ・休暇日を除いた登録済の日付全てを上書き修正します。※一括削除は休暇日も含みます。
                </div>
                <div className="mb-2">
                  ・休暇日の修正は個別に行ってください。
                </div>
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>日付</Label>
            <FlatPickr
              disabled={!identificationModify}
              value={!identificationModify ? "" : targetDates}
              onChange={(value) => setTargetDates(value)}
              className="form-control w-50"
              options={{
                disable: noEntryDates,
                minDate: firstDayOfMonth,
                maxDate: lastDayOfMonth,
                dateFormat: "Y/m/d",
                locale: Japanese,
                mode: "multiple",
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>開始時刻</Label>
                <Checkbox
                  checked={startTimeModify}
                  onCheckedChange={() => {
                    setStartTime(employee.startTime);
                    setStartTimeModify(!startTimeModify);
                  }}
                  disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                />
              </div>
              <Input
                type="time"
                value={startTime}
                list="data-list-start-15"
                onChange={(e) => setStartTime(e.target.value)}
                step={900}
                disabled={!startTimeModify}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>終了時刻</Label>
                <Checkbox
                  checked={endTimeModify}
                  onCheckedChange={() => {
                    setEndTime(employee.endTime);
                    setEndTimeModify(!endTimeModify);
                  }}
                  disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                />
              </div>
              <Input
                type="time"
                value={endTime}
                list="data-list-end-15"
                onChange={(e) => setEndTime(e.target.value)}
                step={900}
                disabled={!endTimeModify}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>休憩</Label>
                <Checkbox
                  checked={restModify}
                  onCheckedChange={() => {
                    setRest("1.00");
                    setRestModify(!restModify);
                  }}
                  disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                />
              </div>
              <Input
                type="number"
                value={rest}
                onChange={(e) => setRest(e.target.value)}
                placeholder="ex:1.00"
                step="0.25"
                disabled={!restModify}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>勤務形態</Label>
                <Checkbox
                  checked={workStyleModify}
                  onCheckedChange={() => {
                    setWorkStyle(
                      WorkStyle[getWorkStyleKey(employee.basicWorkStyle)].code
                    );
                    setWorkStyleModify(!workStyleModify);
                  }}
                  disabled={AbsentData[getAbsentDataKey(absentCode)].allday}
                />
              </div>
              <Select
                value={workStyle}
                onValueChange={(value) => setWorkStyle(value)}
                disabled={!workStyleModify}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(WorkStyle).map((obj) => {
                    const workStyleObj =
                      obj as import("@/types/types").TypeWorkStyle[keyof import("@/types/types").TypeWorkStyle];
                    return (
                      <SelectItem
                        key={workStyleObj.code}
                        value={workStyleObj.code}
                      >
                        {workStyleObj.mean}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>区分</Label>
                <Checkbox
                  checked={absentCodeModify}
                  onCheckedChange={() => {
                    setAbsentCode(AbsentData.none.code);
                    setAbsentCodeModify(!absentCodeModify);
                  }}
                />
              </div>
              <Select
                value={absentCode}
                onValueChange={handleChangeaAbsent}
                disabled={!absentCodeModify}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AbsentData).map((ab) => {
                    const absentObj =
                      ab as import("@/types/types").TypeAbsentData[keyof import("@/types/types").TypeAbsentData];
                    return (
                      <SelectItem key={absentObj.code} value={absentObj.code}>
                        {absentObj.caption}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>備考</Label>
              <Checkbox
                checked={noteModify}
                onCheckedChange={() => {
                  setNote("");
                  setNoteModify(!noteModify);
                }}
              />
            </div>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="休暇等の補足情報"
              disabled={!noteModify}
            />
          </div>
        </div>
        <DialogFooter className="justify-between mt-4">
          <Button
            disabled={identificationModify && targetDates.length === 0}
            variant={
              identificationModify && targetDates.length === 0
                ? "secondary"
                : "destructive"
            }
            onClick={handleDelete}
            size="lg"
          >
            一括削除
          </Button>
          <Button
            disabled={
              (identificationModify && targetDates.length === 0) ||
              enteredAlldayFalseDates.length === 0
            }
            variant={
              (identificationModify && targetDates.length === 0) ||
              enteredAlldayFalseDates.length === 0
                ? "secondary"
                : "default"
            }
            onClick={handleSubmit}
            size="lg"
          >
            一括修正
          </Button>
        </DialogFooter>
      </DialogContent>
      <TimeList15 />
    </Dialog>
  );
}
