"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import { signIn } from "next-auth/react";
import Image from "next/image";
import slackIcon from "@/app/slackIcon.png";
import styles from "@/styles/Login.module.css";
import actIcon from "@/app/logo.png";
import { Button } from "@/components/ui/button";

/**
 * @description
 * ログイン画面
 */
export default function LoginMain() {
  return (
    <div className={styles.container}>
      <main className={styles.loginBox}>
        <Image src={actIcon} alt="" width={100} height={100} />
        <h1 className={styles.loginTitle}>Sign in to ACTApp</h1>
        <div className={styles.buttonContainer}>
          <Button
            onClick={() => signIn("slack", { callbackUrl: "/" })}
            variant="outline"
            size="lg"
            className={styles.loginButton}
          >
            <Image
              src={slackIcon}
              alt=""
              width={30}
              height={30}
              className={styles.slackIcon}
            />
            <span>Sign in with Slack</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
