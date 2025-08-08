// Test if R2Service can be imported without static class blocks error
try {
  require('./lib/r2.ts');
  console.log('✅ R2Service imported successfully - no static class blocks error!');
} catch (error) {
  console.error('❌ Import failed:', error.message);
}
