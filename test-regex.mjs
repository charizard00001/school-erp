// Test regex patterns against model outputs
const patterns = [
  '<function/run_python_code>{"code": "print(25)"}</function>',
  '<function.run_python_code>{"code": "print(25)"}</function>',
  '<function=run_python_code>{"code": "print(25)"}</function>',
  '<function/run_python_code":{"code": "print(25)"} </function>',
  '<|python_tag|>run_python_code """\nprint(25)\n"""',
];

const re = /<function[^>]*run_python_code[^>]*>\s*(\{[\s\S]*?\})\s*<\/function>/;

for (const p of patterns) {
  const m = p.match(re);
  console.log(m ? `MATCHED: ${m[1]}` : `NO MATCH: ${p.substring(0, 60)}`);
}
