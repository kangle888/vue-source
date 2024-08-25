// 进行打包 monerepo 的脚本

// 1 获取所有的包
const fs = require('fs');

const dirs = fs.readdirSync('packages').filter(dir => {
  return fs.statSync(`packages/${dir}`).isDirectory();
});

// 2 执行打包 并行打包
async function build(target) {
  // 动态导入 execa 模块
  const { execa } = await import('execa');
  // execa -c 代表执行rollup的配置文件 --environment 传递环境变量
  await execa('rollup', ['-c', '--environment', `TARGET:${target}`,'--bundleConfigAsCjs'], { stdio: 'inherit' });
}


function runParallel(dirs, iteratorFn) {
  const tasks = [];
  dirs.forEach(dir => {
    const p = iteratorFn(dir);
    tasks.push(p);
  });

  return Promise.all(tasks); // 等待所有的promise 打包执行完
  
}

runParallel(dirs, build).then(() => {
  console.log('build success');
});

console.log(dirs);