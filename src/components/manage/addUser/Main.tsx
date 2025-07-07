"use client";

import React, { FormEvent, ReactElement } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Form,
  ToggleButton,
} from "react-bootstrap";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AdminRights } from "@/lib/constants";
import { useFormik } from "formik";
import * as Yup from "yup";

const radios = [
  { name: AdminRights.general.caption, value: AdminRights.general.code },
  { name: AdminRights.admin.caption, value: AdminRights.admin.code },
  { name: AdminRights.leader.caption, value: AdminRights.leader.code },
];

/**
 * @description
 * ユーザー追加‗メインコンポーネント
 */
export default function AddUserMain() {
  const [alertHTML, setAlertHTML] = React.useState<ReactElement | null>(null);
  const [adminValue, setAdminValue] = React.useState("0");
  const router = useRouter();

  // 社員情報登録
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const employeeId = document.querySelector(
      'input[name="employeeId"]'
    ) as HTMLInputElement;
    const email = document.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    const employeeName = document.querySelector(
      'input[name="employeeName"]'
    ) as HTMLInputElement;
    const section = document.querySelector(
      'input[name="section"]'
    ) as HTMLInputElement;

    // バリデーションエラー or 未入力 で却下
    if (
      Object.keys(formik.errors).length > 0 ||
      [employeeId.value, email.value, employeeName.value, section.value].some(
        (value) => value === ""
      )
    )
      return setAlertHTML(
        <Alert variant={"danger"}>項目を正しく入力してください。</Alert>
      );

    // employeeに登録するAPI
    try {
      await axios.post("/api/employee/entry", {
        id: employeeId.value,
        email: email.value,
        name: employeeName.value,
        section: section.value,
        admin: adminValue,
      });

      // 管理画面にとばす
      router.push("/manage/status");
    } catch (err) {
      console.error(err);
    }
  };

  const formik = useFormik({
    initialValues: {
      employeeId: "",
      employeeName: "",
      email: "",
      section: "",
    },
    validationSchema: Yup.object({
      employeeId: Yup.number()
        .positive()
        .required()
        .test("digit-validation", "not 6 digits", (value) => {
          const digitCount = String(value).length;
          const requiredDigitCount = 6;

          return digitCount === requiredDigitCount;
        }),
      employeeName: Yup.string().required(),
      email: Yup.string().email().required(),
      section: Yup.string().required(),
    }),
    onSubmit: () => {},
  });

  return (
    <>
      <div className="mt-3">
        <Form className="px-5 manageEntryComponent" onSubmit={handleSubmit}>
          {alertHTML}
          <Form.Group className="mb-4">
            <Form.Label className="fs-5">社員番号</Form.Label>
            <Form.Control
              type="text"
              name="employeeId"
              placeholder="123456"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.employeeId}
              isInvalid={
                formik.touched.employeeId && formik.errors.employeeId
                  ? true
                  : false
              }
            />
            <Form.Control.Feedback type="invalid">
              不正な入力形式です。
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fs-5">氏名</Form.Label>
            <Form.Control
              type="text"
              name="employeeName"
              placeholder="田中　太郎"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.employeeName}
              isInvalid={
                formik.touched.employeeName && formik.errors.employeeName
                  ? true
                  : false
              }
            />
            <Form.Control.Feedback type="invalid">
              不正な入力形式です。
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fs-5">メールアドレス</Form.Label>
            <Form.Control
              type="text"
              name="email"
              placeholder="taro_tanaka@actcity.co.jp"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              isInvalid={
                formik.touched.email && formik.errors.email ? true : false
              }
            />
            <Form.Control.Feedback type="invalid">
              不正な入力形式です。
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fs-5">勤務地</Form.Label>
            <Form.Control
              type="text"
              name="section"
              placeholder="半蔵門"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.section}
              isInvalid={
                formik.touched.section && formik.errors.section ? true : false
              }
            />
            <Form.Control.Feedback type="invalid">
              不正な入力形式です。
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-5">
            <Form.Label className="fs-5">権限</Form.Label>
            <br />
            <ButtonGroup>
              {radios.map((radio, idx) => (
                <ToggleButton
                  key={idx}
                  id={`admin-${idx}`}
                  type="radio"
                  name="admin"
                  variant="outline-success"
                  value={radio.value.toString()}
                  checked={adminValue === radio.value}
                  onChange={(e) => {
                    setAdminValue(e.currentTarget.value);
                  }}
                >
                  {radio.name}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </Form.Group>
          <Form.Group className="text-end pb-3">
            <Button
              variant="primary"
              size="lg"
              className="mt-4 px-5 fw-bold"
              type="submit"
            >
              登録
            </Button>
          </Form.Group>
        </Form>
      </div>
    </>
  );
}
