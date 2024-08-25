
async function build(target) {
  // 动态导入 execa 模块
  const { execa } = await import('execa');
  // execa -c 代表执行rollup的配置文件 --environment 传递环境变量
  await execa('rollup', ['-cw', '--environment', `TARGET:${target}`,'--bundleConfigAsCjs'], { stdio: 'inherit' });
}

build('reactivity');