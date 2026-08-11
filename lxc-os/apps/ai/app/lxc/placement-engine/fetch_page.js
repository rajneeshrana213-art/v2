const http = require('http');

http.get('http://localhost:5000/lxc/placement-engine?course=webdev_master_class&theme=light', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('--- Page HTML ---');
    console.log(`Length: ${data.length}`);
    // Check if toc-nav is in the static HTML
    const idx = data.indexOf('id="toc-nav"');
    if (idx !== -1) {
      console.log('Found id="toc-nav" in server-side rendered HTML:');
      console.log(data.substring(idx - 100, idx + 800));
    } else {
      console.log('id="toc-nav" NOT found in server-side rendered HTML.');
    }
  });
}).on('error', err => {
  console.error('Fetch error:', err.message);
});
