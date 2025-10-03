import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  StyledTableContainer,
  tableHeaderStyle,
  actionButtonsStyle,
} from "./TableStyles";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

// Create a test theme
const testTheme = createTheme();

const TestTable = () => (
  <StyledTableContainer>
    <TableHead>
      <TableRow>
        <TableCell>Header 1</TableCell>
        <TableCell>Header 2</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>Cell 1</TableCell>
        <TableCell>Cell 2</TableCell>
      </TableRow>
    </TableBody>
  </StyledTableContainer>
);

describe("TableStyles", () => {
  it("renders StyledTableContainer without theme errors", () => {
    expect(() => {
      render(
        <ThemeProvider theme={testTheme}>
          <TestTable />
        </ThemeProvider>
      );
    }).not.toThrow();
  });

  it("tableHeaderStyle returns proper styles when called with theme", () => {
    const styles = tableHeaderStyle(testTheme);
    expect(styles).toHaveProperty("backgroundColor");
    expect(styles).toHaveProperty("fontWeight");
    expect(styles).toHaveProperty("fontSize");
  });

  it("actionButtonsStyle returns proper styles when called with theme", () => {
    const styles = actionButtonsStyle(testTheme);
    expect(styles).toHaveProperty("display", "flex");
    expect(styles).toHaveProperty("gap");
    expect(styles).toHaveProperty("alignItems", "center");
  });
});
