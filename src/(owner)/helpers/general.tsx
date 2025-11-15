export const allMonths = Array.from({ length: 12 }, (_e, i) => {
  return new Date(0, i, 1).toLocaleString("en-US", { month: "long" });
});
