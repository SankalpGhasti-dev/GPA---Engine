import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Sem3MarksTab from "./Sem3MarksTab";
import sem3Engine, {
  SUBJECTS,
  getComponents,
  getMaxMarks,
  computeSubject,
  targetCalculator,
  GRADE_SYSTEM,
  collegeRound,
} from "../../data/sem3Engine";

describe("Sem3MarksTab UI Component Integration", () => {
  const setup = (customMarks = {}, expanded = "SEM3_MATH") => {
    const marks = { ...customMarks };
    const subjectResults = {};
    for (const s of SUBJECTS) {
      subjectResults[s.code] = {
        ...computeSubject(s, marks[s.code] || {}),
        credits: s.credits,
        code: s.code,
      };
    }

    const setComponent = jest.fn();
    const setCustomName = jest.fn();
    const setTargetGradeMap = jest.fn();
    const setExpandedSubject = jest.fn();
    const clearAll = jest.fn();

    const utils = render(
      <Sem3MarksTab
        subjects={SUBJECTS}
        marks={marks}
        subjectResults={subjectResults}
        customNames={{}}
        setComponent={setComponent}
        setCustomName={setCustomName}
        targetGradeMap={{}}
        setTargetGradeMap={setTargetGradeMap}
        expandedSubject={expanded}
        setExpandedSubject={setExpandedSubject}
        hasAnyData={Object.keys(marks).length > 0}
        clearAll={clearAll}
        getComponents={getComponents}
        getMaxMarks={getMaxMarks}
        GRADE_SYSTEM={GRADE_SYSTEM}
        collegeRound={collegeRound}
        targetCalculator={targetCalculator}
      />
    );

    return {
      ...utils,
      setComponent,
      subjectResults,
    };
  };

  test("Subjects 1–3 show CA1 /10, CA2 /10, MSE /30, ESE /50 fields when expanded", () => {
    setup({}, "SEM3_MATH");
    const body = document.querySelector(".subject-card-body");
    expect(body).toBeInTheDocument();
    expect(within(body).getByText("CA1")).toBeInTheDocument();
    expect(within(body).getByText("CA2")).toBeInTheDocument();
    expect(within(body).getAllByText("/10").length).toBe(2);
    expect(within(body).getByText("MSE")).toBeInTheDocument();
    expect(within(body).getByText("/30")).toBeInTheDocument();
    expect(within(body).getByText("ESE")).toBeInTheDocument();
    expect(within(body).getByText("/50")).toBeInTheDocument();
  });

  test("Subjects 4–5 show CA1 /25 and CA2 /25 without MSE or ESE", () => {
    setup({}, "SEM3_ENV");
    const body = document.querySelector(".subject-card-body");
    expect(body).toBeInTheDocument();
    expect(within(body).getByText("CA1")).toBeInTheDocument();
    expect(within(body).getByText("CA2")).toBeInTheDocument();
    expect(within(body).getAllByText("/25").length).toBe(2);
    expect(within(body).queryByText("MSE")).not.toBeInTheDocument();
    expect(within(body).queryByText("ESE")).not.toBeInTheDocument();
  });

  test("Aptitude Skills I and Language Skills I show CA1 /25 and CA2 /25 (Total: 50)", () => {
    setup({}, "SEM3_APT");
    const body = document.querySelector(".subject-card-body");
    expect(body).toBeInTheDocument();
    expect(within(body).getByText("CA1")).toBeInTheDocument();
    expect(within(body).getByText("CA2")).toBeInTheDocument();
    expect(within(body).getAllByText("/25").length).toBe(2);
    expect(within(body).queryByText("MSE")).not.toBeInTheDocument();
    expect(within(body).queryByText("ESE")).not.toBeInTheDocument();
  });

  test("Multidisciplinary Minor and Open Elective show CA1 /10, CA2 /10, MSE /30, ESE /50 (Total: 100)", () => {
    setup({}, "SEM3_MINOR");
    const body = document.querySelector(".subject-card-body");
    expect(body).toBeInTheDocument();
    expect(within(body).getByText("CA1")).toBeInTheDocument();
    expect(within(body).getByText("CA2")).toBeInTheDocument();
    expect(within(body).getAllByText("/10").length).toBe(2);
    expect(within(body).getByText("MSE")).toBeInTheDocument();
    expect(within(body).getByText("/30")).toBeInTheDocument();
    expect(within(body).getByText("ESE")).toBeInTheDocument();
    expect(within(body).getByText("/50")).toBeInTheDocument();
  });

  test("Subjects 8–10 show CA1 /15, CA2 /15, and Oral/Viva /20", () => {
    setup({}, "SEM3_DSA_LAB");
    const body = document.querySelector(".subject-card-body");
    expect(body).toBeInTheDocument();
    expect(within(body).getByText("CA1")).toBeInTheDocument();
    expect(within(body).getByText("CA2")).toBeInTheDocument();
    expect(within(body).getAllByText("/15").length).toBe(2);
    expect(within(body).getByText("Oral/Viva")).toBeInTheDocument();
    expect(within(body).getByText("/20")).toBeInTheDocument();
    expect(within(body).queryByText("Practical")).not.toBeInTheDocument();
  });

  test("Subject 8 (Mini Project II) displays CA1 /15, CA2 /15, Oral/Viva /20", () => {
    setup({}, "SEM3_MINI");
    const body = document.querySelector(".subject-card-body");
    expect(body).toBeInTheDocument();
    expect(within(body).getByText("CA1")).toBeInTheDocument();
    expect(within(body).getByText("CA2")).toBeInTheDocument();
    expect(within(body).getAllByText("/15").length).toBe(2);
    expect(within(body).getByText("Oral/Viva")).toBeInTheDocument();
    expect(within(body).getByText("/20")).toBeInTheDocument();
  });

  test("Subject 11 (WT Lab) displays CA1 /15, CA2 /15, Oral/Viva /20", () => {
    setup({}, "SEM3_WT_LAB");
    const body = document.querySelector(".subject-card-body");
    expect(body).toBeInTheDocument();
    expect(within(body).getByText("CA1")).toBeInTheDocument();
    expect(within(body).getByText("CA2")).toBeInTheDocument();
    expect(within(body).getAllByText("/15").length).toBe(2);
    expect(within(body).getByText("Oral/Viva")).toBeInTheDocument();
    expect(within(body).getByText("/20")).toBeInTheDocument();
  });

  test("Entering marks calls setComponent with clamped values within max", () => {
    const { setComponent } = setup({}, "SEM3_MATH");
    const body = document.querySelector(".subject-card-body");
    const inputs = within(body).getAllByRole("spinbutton");
    // CA1 is inputs[0] (max 10), CA2 is inputs[1] (max 10), MSE is inputs[2] (max 30), ESE is inputs[3] (max 50)
    expect(inputs.length).toBe(4);

    // Enter 25 in MSE (max 30) -> should allow 25
    fireEvent.change(inputs[2], { target: { value: "25" } });
    expect(setComponent).toHaveBeenCalledWith("SEM3_MATH", "mse", 25);

    // Enter 35 in MSE (max 30) -> should clamp to 30
    fireEvent.change(inputs[2], { target: { value: "35" } });
    expect(setComponent).toHaveBeenCalledWith("SEM3_MATH", "mse", 30);
  });

  test("Target calculator in UI shows correct requirements when MSE is partially completed", () => {
    // Math: CA1=10, CA2=10, MSE=25 -> Total secured = 45 / 100
    // Default target grade AB (min 80%). Still needs 80 - 45 = 35 from ESE.
    setup({ SEM3_MATH: { ca1: 10, ca2: 10, mse: 25 } }, "SEM3_MATH");

    expect(screen.getByText(/Need 35\/50 from ESE/i)).toBeInTheDocument();
  });
});
