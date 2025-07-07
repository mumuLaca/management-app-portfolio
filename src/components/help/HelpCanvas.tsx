"use client";

import React, { Dispatch, JSX, SetStateAction, createContext } from "react";
import { Offcanvas } from "react-bootstrap";
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
      <Offcanvas
        show={showHelp}
        onHide={modalClose}
        placement="end"
        scroll={true}
        backdrop={false}
        className={styles.offCanvasLayout}
      >
        <Offcanvas.Header
          closeButton
          closeVariant="white"
          className={styles.header}
        >
          <Offcanvas.Title>
            <button
              className={styles.HCLinkTop}
              onClick={() => setDisplayComponent(<PageMain />)}
            >
              <GiExitDoor />
              <span>ヘルプ</span>
            </button>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className={scrollStyles.scrollHidden}>
          <displayComponentContext.Provider
            value={{ displayComponent, setDisplayComponent }}
          >
            <div>{displayComponent}</div>
          </displayComponentContext.Provider>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
