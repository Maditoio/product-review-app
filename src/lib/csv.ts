type CsvReview = {
  reviewerName: string;
  starRating: number;
  selectedOptions: string;
  submittedAt: string;
};

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function createReviewsCsv(rows: CsvReview[]) {
  const header = ["reviewer name", "star rating", "selected options", "date"];
  const dataRows = rows.map((row) => [
    escapeCsv(row.reviewerName),
    row.starRating.toString(),
    escapeCsv(row.selectedOptions),
    escapeCsv(row.submittedAt),
  ]);

  return [header, ...dataRows].map((row) => row.join(",")).join("\n");
}
