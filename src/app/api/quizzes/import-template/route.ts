import { NextResponse } from "next/server";

const template = `Question,Points,ImageUrl,Answer1,Answer2,Answer3,Answer4,Answer5,CorrectIndex
"What is the capital of Indonesia?",1,,Jakarta,Bandung,Surabaya,Medan,,0
"What is 2 + 2?",2,,3,4,5,,,1
"Which planet is known as the Red Planet?",1,,Venus,Mars,Jupiter,Saturn,,1`;

export async function GET() {
  return new NextResponse(template, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=import_template.csv",
    },
  });
}
