#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface ProcessInfo {
  pid: number;
  name: string;
}

class DevRunner {
  private processes: ProcessInfo[] = [];
  private caddyProcess: any = null;
  private viteProcess: any = null;

  constructor() {
    // 프로세스 종료 시 정리
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
    process.on('exit', () => this.cleanup());
  }

  async checkCaddyInstallation(): Promise<boolean> {
    try {
      await execAsync('which caddy');
      console.log('✅ Caddy가 설치되어 있습니다.');
      return true;
    } catch (error) {
      console.error('❌ Caddy가 설치되어 있지 않습니다.');
      console.log('📦 설치 방법:');
      console.log('   macOS: brew install caddy');
      console.log('   Ubuntu/Debian: sudo apt install caddy');
      console.log('   또는 https://caddyserver.com/docs/install 에서 설치');
      return false;
    }
  }

  async waitForUrl(url: string, timeout: number = 30000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        // curl을 사용하여 URL이 응답하는지 확인
        await execAsync(`curl -k -s -o /dev/null -w "%{http_code}" ${url}`);
        console.log(`✅ ${url} 서버가 준비되었습니다.`);
        return true;
      } catch (error) {
        // 1초 대기 후 다시 시도
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.error(`❌ ${url} 서버가 ${timeout}ms 내에 준비되지 않았습니다.`);
    return false;
  }

  async startCaddy(): Promise<boolean> {
    try {
      console.log('🚀 Caddy 서버를 시작합니다...');

      this.caddyProcess = spawn('caddy', ['run', '--config', 'Caddyfile'], {
        stdio: 'pipe',
        detached: false,
      });

      this.caddyProcess.stdout?.on('data', (data: Buffer) => {
        console.log(`[Caddy] ${data.toString().trim()}`);
      });

      this.caddyProcess.stderr?.on('data', (data: Buffer) => {
        console.log(`[Caddy Error] ${data.toString().trim()}`);
      });

      this.caddyProcess.on('error', (error: Error) => {
        console.error('❌ Caddy 시작 실패:', error.message);
        return false;
      });

      // Caddy가 시작될 때까지 대기
      const isReady = await this.waitForUrl('https://local.vibelist.com:443', 10000);
      return isReady;
    } catch (error) {
      console.error('❌ Caddy 시작 중 오류:', error);
      return false;
    }
  }

  async startVite(): Promise<void> {
    try {
      console.log('⚡ Vite 개발 서버를 시작합니다...');
      console.log('🌐 프록시 주소: https://local.vibelist.com');

      this.viteProcess = spawn('npx', ['vite', '--port', '3000'], {
        stdio: 'inherit',
        detached: false,
      });

      this.viteProcess.on('error', (error: Error) => {
        console.error('❌ Vite 시작 실패:', error.message);
      });

      this.viteProcess.on('exit', (code: number) => {
        console.log(`Vite 프로세스가 종료되었습니다. (코드: ${code})`);
        this.cleanup();
      });
    } catch (error) {
      console.error('❌ Vite 시작 중 오류:', error);
    }
  }

  async cleanup(): Promise<void> {
    console.log('\n🧹 프로세스를 정리합니다...');

    // Vite 프로세스 종료
    if (this.viteProcess) {
      try {
        this.viteProcess.kill('SIGTERM');
        console.log('✅ Vite 프로세스가 종료되었습니다.');
      } catch (error) {
        console.error('❌ Vite 프로세스 종료 실패:', error);
      }
    }

    // Caddy 프로세스 종료
    if (this.caddyProcess) {
      try {
        this.caddyProcess.kill('SIGTERM');
        console.log('✅ Caddy 프로세스가 종료되었습니다.');
      } catch (error) {
        console.error('❌ Caddy 프로세스 종료 실패:', error);
      }
    }

    // 추가로 Caddy 프로세스가 남아있으면 강제 종료
    try {
      await execAsync('pkill -f "caddy run"');
      console.log('✅ 남은 Caddy 프로세스를 정리했습니다.');
    } catch (error) {
      // 프로세스가 없으면 무시
    }

    process.exit(0);
  }

  async run(): Promise<void> {
    console.log('🎯 VibeList 개발 환경을 시작합니다...\n');
    console.log('📋 접속 정보:');
    console.log('   - 로컬 주소: http://localhost:3000');
    console.log('   - 프록시 주소: https://local.vibelist.com');
    console.log('');

    // 1. Caddy 설치 확인
    const isCaddyInstalled = await this.checkCaddyInstallation();
    if (!isCaddyInstalled) {
      process.exit(1);
    }

    // 2. Caddy 시작
    const caddyStarted = await this.startCaddy();
    if (!caddyStarted) {
      console.error('❌ Caddy 시작에 실패했습니다.');
      process.exit(1);
    }

    // 3. Vite 시작
    await this.startVite();
  }
}

// 스크립트 실행
const runner = new DevRunner();
runner.run().catch(error => {
  console.error('❌ 개발 환경 시작 실패:', error);
  process.exit(1);
});
