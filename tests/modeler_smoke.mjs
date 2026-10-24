#!/usr/bin/env node
// Tests an engineer-built offline reference, not generated model competence.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const html = await readFile(new URL('../web-test/modeler.html',import.meta.url));
const server = createServer((request,response) => {
  if (request.url !== '/') { response.writeHead(404).end(); return; }
  response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); response.end(html);
});
await new Promise((resolve,reject) => { server.once('error',reject); server.listen(0,'127.0.0.1',resolve); });
let browser, checks = 0;
try {
  browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const origin = 'http://127.0.0.1:' + server.address().port;
  for (const viewport of [{width:1280,height:900},{width:390,height:844}]) {
    const context = await browser.newContext({viewport}), page = await context.newPage(), errors = [], external = [];
    page.on('pageerror',error => errors.push(error.message));
    page.on('request',request => { if (!request.url().startsWith(origin + '/')) external.push(request.url()); });
    const passed = name => { checks++; console.log('PASS ' + viewport.width + 'px: ' + name); };
    const canvas = page.locator('canvas'), list = page.locator('#objects button');
    const hash = () => canvas.evaluate(c => {
      const data = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let value = 2166136261; for (const byte of data) value = Math.imul(value ^ byte,16777619); return value >>> 0;
    });
    const set = async (id,value) => { const input = page.locator('#' + id); await input.fill(String(value)); await input.dispatchEvent('change'); };
    const select = id => page.getByRole('button',{name:'Cube ' + id,exact:true}).click();
    try {
      await page.goto(origin,{waitUntil:'load'});
      assert.equal(await page.title(),'§wyrlz Cube Workshop');
      assert.equal(await list.count(),1);
      assert.equal(await list.first().getAttribute('aria-pressed'),'true');
      const colors = await canvas.evaluate(c => new Set(new Uint32Array(c.getContext('2d').getImageData(0,0,c.width,c.height).data.buffer)).size);
      assert.ok(colors > 20); passed('initial selected cube renders with visible faces');

      const transforms = {positionX:.7,positionY:.9,positionZ:-.6,scaleX:1.5,scaleY:1.7,scaleZ:.8};
      for (const [id,value] of Object.entries(transforms)) {
        const before = await hash(); await set(id,value); assert.notEqual(await hash(),before,id + ' must visibly affect geometry');
      }
      passed('all six position and scale controls change the rendered scene');

      await page.getByRole('button',{name:'Add Cube',exact:true}).click();
      assert.equal(await list.count(),2);
      assert.equal(await page.getByRole('button',{name:'Cube 2',exact:true}).getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('#scaleX').inputValue(),'1');
      await set('positionX',-1.6); passed('add creates and selects a distinct cube');

      await select(1);
      for (const [id,value] of Object.entries(transforms)) assert.equal(Number(await page.locator('#' + id).inputValue()),value);
      await select(2); assert.equal(Number(await page.locator('#positionX').inputValue()),-1.6);
      await select(1); for (const [id,value] of Object.entries({positionX:0,positionY:.5,positionZ:0})) await set(id,value);
      passed('selection restores independent transforms for each object');

      await select(2);
      const box = await canvas.boundingBox(); await canvas.click({position:{x:box.width / 2,y:box.height / 2}});
      assert.equal(await page.getByRole('button',{name:'Cube 1',exact:true}).getAttribute('aria-pressed'),'true');
      passed('canvas hit testing selects the cube beneath the pointer');

      const normal = await hash(), bounds = await canvas.boundingBox();
      await page.mouse.move(bounds.x + bounds.width / 2,bounds.y + bounds.height / 2); await page.mouse.down();
      await page.mouse.move(bounds.x + bounds.width / 2 + 40,bounds.y + bounds.height / 2 + 25,{steps:4}); await page.mouse.up();
      assert.notEqual(await hash(),normal);
      await page.getByRole('button',{name:'Reset View',exact:true}).click(); assert.equal(await hash(),normal);
      await canvas.hover(); await page.mouse.wheel(0,120); await page.waitForTimeout(80); assert.notEqual(await hash(),normal);
      await page.getByRole('button',{name:'Reset View',exact:true}).click(); assert.equal(await hash(),normal);
      await canvas.focus(); await page.keyboard.press('ArrowRight'); assert.notEqual(await hash(),normal);
      await page.getByRole('button',{name:'Reset View',exact:true}).click();
      await page.getByRole('button',{name:'Zoom In',exact:true}).click(); assert.notEqual(await hash(),normal);
      await page.getByRole('button',{name:'Reset View',exact:true}).click();
      await page.getByRole('button',{name:'Orbit Left',exact:true}).click(); assert.notEqual(await hash(),normal);
      passed('drag, wheel, keyboard and camera buttons change the view; reset restores it');

      await page.getByRole('button',{name:'Cube 1',exact:true}).focus(); await page.keyboard.press('Enter');
      assert.equal(await page.getByRole('button',{name:'Cube 1',exact:true}).getAttribute('aria-pressed'),'true');
      assert.equal(await page.getByRole('button',{name:'Cube 1',exact:true}).evaluate(button => button === document.activeElement),true);
      await canvas.focus(); await page.keyboard.press('Delete');
      assert.equal(await list.count(),1); assert.equal(await list.first().textContent(),'Cube 2');
      assert.equal(Number(await page.locator('#positionX').inputValue()),-1.6);
      passed('keyboard selection retains focus; Delete removes only the selected object');

      await page.getByRole('button',{name:'Delete Cube',exact:true}).click();
      assert.equal(await list.count(),0);
      assert.equal(await page.getByRole('button',{name:'Delete Cube',exact:true}).isDisabled(),true);
      assert.equal(await page.locator('#positionX').isDisabled(),true);
      await page.getByRole('button',{name:'Add Cube',exact:true}).click();
      assert.equal(await list.count(),1); assert.equal(await page.locator('#positionX').isEnabled(),true);
      passed('empty scene disables transforms and can add a fresh cube');

      await set('scaleX',99); assert.equal(await page.locator('#scaleX').inputValue(),'4');
      await set('scaleY',-99); assert.equal(await page.locator('#scaleY').inputValue(),'0.1');
      await set('positionZ',99); assert.equal(await page.locator('#positionZ').inputValue(),'5');
      await set('positionZ',''); assert.equal(await page.locator('#positionZ').inputValue(),'5');
      assert.ok(Number.isInteger(await hash())); passed('numeric bounds and blank edits preserve finite transforms');

      while (await list.count() < 9) await page.getByRole('button',{name:'Add Cube',exact:true}).click();
      assert.equal(await page.getByRole('button',{name:'Add Cube',exact:true}).isDisabled(),true);
      await page.getByRole('button',{name:'Delete Cube',exact:true}).click();
      assert.equal(await list.count(),8); assert.equal(await page.getByRole('button',{name:'Add Cube',exact:true}).isEnabled(),true);
      passed('scene limit disables Add and deletion frees a slot');

      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),true);
      for (const locator of [page.locator('#positionX'),page.locator('#scaleZ'),page.getByRole('button',{name:'Add Cube',exact:true})]) {
        await locator.scrollIntoViewIfNeeded(); const rect = await locator.boundingBox();
        assert.ok(rect && rect.x >= 0 && rect.x + rect.width <= viewport.width && rect.y >= 0 && rect.y < viewport.height);
      }
      assert.notEqual(await page.locator('body').evaluate(body => getComputedStyle(body).overflow),'hidden');
      passed('narrow and desktop layouts fit with reachable controls');

      await page.reload({waitUntil:'load'}); assert.equal(await list.count(),1);
      assert.equal(await page.locator('#positionX').inputValue(),'0');
      assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
      passed('refresh resets the scene without script errors or external requests');
    } finally { await context.close(); }
  }
  console.log('PASS ' + checks + ' modeler browser checks; engineer-built reference only, no model acceptance claimed');
} finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
