import { readFileSync as R, readdirSync as L, mkdirSync as K, writeFileSync as W } from "node:fs";
const T = Buffer.from("ABFBBAYKCw///////////wkJCQkJCQkFCQkJBQkJCf8JCQn/////////////////ICQkIAD//////////////wUI//////////////////8EBAEE", "base64");
const enc = new TextEncoder();
function run(p: Uint8Array, inp: Uint8Array) {
const n = p.length, D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256), out = new Uint8Array(65536);
let sp = 0, csp = 0, olen = 0, inPos = 0, pc = 0, steps = 0, t = 0, a = 0, s: Uint8Array;
const done = (exit: number) => ({ stdout: out.subarray(0, olen), exit });
const u16 = (i: number) => p[i] | (p[i + 1] << 8);
for (;;) {
if (steps === 1e6) return done(10);
if (pc < 0 || pc >= n) return done(9);
const op = p[pc], info = op < 84 ? T[op] : 255;
if (info === 255) return done(5);
const imm = info >> 4;
if (pc + imm >= n) return done(9);
steps++;
const next = pc + 1 + imm, pops = (info >> 2) & 3;
if (sp < pops) return done(2);
if (sp - pops + (info & 3) > 256) return done(3);
pc = next;
if (op >= 16 && op <= 34 && op !== 23 && op !== 27) {
const b = D[--sp]; a = D[--sp];
if (op >= 19 && op <= 22 && !b) return done(4);
const u = a >>> 0, v = b >>> 0;
D[sp++] = op === 16 ? (a + b) | 0 : op === 17 ? (a - b) | 0 : op === 18 ? Math.imul(a, b) :
op === 19 ? (a / b) | 0 : op === 20 ? (a % b) | 0 : op === 21 ? (u / v) | 0 : op === 22 ? u % v | 0 :
op === 24 ? a & b : op === 25 ? a | b : op === 26 ? a ^ b : op === 28 ? a << b : op === 29 ? a >> b :
op === 30 ? (a >>> b) | 0 : op === 32 ? +(a === b) : op === 33 ? +(a < b) : +(u < v);
continue;
}
switch (op) {
case 0: return done(0);
case 1: D[sp++] = p[next - 1] << 24 >> 24; break;
case 2: D[sp++] = u16(next - 4) | (u16(next - 2) << 16); break;
case 3: sp--; break;
case 4: case 6: D[sp] = D[sp - (op === 4 ? 1 : 2)]; sp++; break;
case 5: t = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = t; break;
case 7: t = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = t; break;
case 23: D[sp - 1] = -D[sp - 1] | 0; break;
case 27: D[sp - 1] = ~D[sp - 1]; break;
case 48: case 49: case 50:
if (op === 48 || (op === 49 ? !D[--sp] : D[--sp])) pc = next + (u16(next - 2) << 16 >> 16);
break;
case 51: if (csp === 64) return done(7); C[csp++] = next; pc = u16(next - 2); break;
case 52: if (!csp) return done(8); pc = C[--csp]; break;
case 64: case 65:
a = D[sp - 1]; if (a >>> 8) return done(6);
if (op === 64) D[sp - 1] = M[a]; else { M[a] = D[sp - 2]; sp -= 2; }
break;
case 80:
s = enc.encode(String(D[sp - 1]));
if (olen + s.length > 65536) return done(11);
sp--; out.set(s, olen); olen += s.length; break;
case 81: if (olen >= 65536) return done(11); out[olen++] = D[--sp] & 255; break;
case 82: D[sp++] = inPos < inp.length ? inp[inPos++] : -1; break;
case 83: return done(D[--sp] & 255);
}
}
}
const I = process.env.MAKEFUN_INPUT_DIR ?? "/input";
const O = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
for (const id of L(I).sort()) {
const r = run(R(`${I}/${id}/program.bin`), R(`${I}/${id}/input.bin`));
const d = `${O}/${id}`;
K(d, { recursive: true });
W(d+"/stdout.bin", r.stdout);
W(d+"/exit.txt", r.exit+"\n");
}
