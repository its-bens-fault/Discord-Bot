const themes = [
    "0",
    "1",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "100",
    "101",
    "102",
    "103",
    "104",
    "105"
];

const layouts = [
    "dagre",
    "elk"
];

export async function renderD2(code, opts) {
    const enc = new TextEncoder();

    const theme = opts?.theme;

    const sketch = opts?.sketch;

    const layout = opts?.layout;

    const bare = opts?.bare;

    const args = [];

    if (sketch)
	args.push("-s");
    if (theme in themes)
	args.push(...["-t",theme]);
    if (layout in layouts)
	args.push(...["-l",layout]);

    args.push(...["-","-"])
    
    const d2Command = new Deno.Command("d2", {
	args,
	stderr: "piped",
	stdout: "piped",
	stdin: "piped"
    });
    const d2 = d2Command.spawn();
    const rsvgCommand = new Deno.Command("rsvg-convert", {
	stderr: "piped",
	stdout: "piped",
	stdin: "piped"
    });
    const rsvg = rsvgCommand.spawn();

    /* The code being submitted is
     * small, no need to worry about
     * streams */
    let code_ = code
    if (!bare)
	code_ = '" ":{\n'+code+'\n}';
    const d2in = await d2.stdin.getWriter();
    await d2in.write(enc.encode(code_));
    await d2in.close()
    const d2out = await d2.output();
    const svg = d2out.stdout;

    const rsvgin = await rsvg.stdin.getWriter();
    
    let i = 0;
    let n = 0;
    do {
	n = await rsvgin.write(svg.slice(i));
	i += n;
    } while(n)
    await rsvgin.close();
    const rsvgout = await rsvg.output();
    const png = rsvgout.stdout;
    
    return png;
}
