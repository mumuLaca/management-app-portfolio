"use client";

import React, { Dispatch, JSX, SetStateAction, createContext } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import styles from "@/styles/Help.module.css";
import scrollStyles from "@/styles/CustomScroll.module.css";
import PageMain from "./Main";
import { GiExitDoor } from "react-icons/gi";

export const displayComponentContext = createContext(
  {} as {
    displayComponent: JSX.Element;
    setDisplayComponent: React.Dispatch<React.SetStateAction<JSX.Element>>;
  }
);

/**
 * @description
 * ヘルプページのoffCanvas
 */
export default function HelpCanvas(props: {
  showHelp: boolean;
  seetShowHelp: Dispatch<SetStateAction<boolean>>;
}) {
  const { showHelp, seetShowHelp } = props;
  const [displayComponent, setDisplayComponent] = React.useState<JSX.Element>(
    <PageMain />
  );

  /** キャンバスクローズ時、初期ページに戻す */
  const modalClose = () => {
    seetShowHelp(false);
    setDisplayComponent(<PageMain />);
  };

  return (
    <>
      <Sheet
        open={showHelp}
        onOpenChange={modalClose}
        className={styles.offCanvasLayout}
      >
        <SheetTrigger className={styles.header}>
          <SheetTitle>
            <button
              className={styles.HCLinkTop}
              onClick={() => setDisplayComponent(<PageMain />)}
            >
              <GiExitDoor />
              <span>ヘルプ</span>
            </button>
          </SheetTitle>
        </SheetTrigger>
        <SheetContent className={scrollStyles.scrollHidden}>
          <displayComponentContext.Provider
            value={{ displayComponent, setDisplayComponent }}
          >
            <div>{displayComponent}</div>
          </displayComponentContext.Provider>
        </SheetContent>
      </Sheet>
    </>
  );
}
