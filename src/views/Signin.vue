<template>
  <section class="auth-page" :class="mode">
    <div class="bg-aurora">
      <span class="orb orb-1"></span>
      <span class="orb orb-2"></span>
      <span class="orb orb-3"></span>
      <span class="grid-lines"></span>
    </div>
    <div class="grain"></div>
    <div class="scanlines"></div>

    <div class="auth-shell">
      <div class="hero">
        <div class="pill">YENFLIX ACCESS</div>
        <h1>TMDB 키로 바로 입장, 큐레이션은 우리가 해줄게요.</h1>
        <p class="lede">
          키 한 번이면 인기·찜목록·검색 결과까지 즉시 동기화됩니다. 로그인 전부터
          감각적인 무드로 환영받는 경험을 준비했어요.
        </p>
        <div class="hero-cards">
          <div class="glow-card">
            <p class="eyebrow">실시간 차트</p>
            <h3>인기 TOP 10 자동 갱신</h3>
            <p class="mini">카테고리별 트렌드를 시각화한 미니 위젯</p>
          </div>
          <div class="glow-card secondary">
            <p class="eyebrow">보안 · 속도</p>
            <h3>API 키 전용 라이트닝 로그인</h3>
            <p class="mini">이중 입력 검증 + 버튼 모션으로 즉시 피드백</p>
          </div>
        </div>
      </div>

      <div class="form-stage">
        <div class="mode-toggle">
          <span class="toggle-pill" :class="mode"></span>
          <button
            class="toggle-btn"
            :class="{ active: mode === 'login' }"
            type="button"
            @click="mode = 'login'"
          >
            로그인
          </button>
          <button
            class="toggle-btn"
            :class="{ active: mode === 'register' }"
            type="button"
            @click="mode = 'register'"
          >
            회원가입
          </button>
        </div>

        <div class="card-stage">
          <div class="card-stack">
            <div class="card-ghost layer-1"></div>
            <div class="card-ghost layer-2"></div>
            <div class="card-ghost layer-3"></div>
          </div>
          <Transition name="deck" mode="out-in">
            <div :key="mode" class="form-card" :class="mode">
              <div class="form-header">
                <div class="eyebrow-row">
                  <p class="eyebrow">{{ mode === 'login' ? 'WELCOME BACK' : 'JOIN US' }}</p>
                  <span class="status-chip" :class="mode">
                    {{ mode === 'login' ? 'Returning Crew' : 'New Crew' }}
                  </span>
                </div>
                <h1>{{ mode === 'login' ? '로그인' : '회원가입' }}</h1>
                <p class="lede">
                  {{
                    mode === 'login'
                      ? 'TMDB API 키로 바로 접속하세요.'
                      : '계정을 만들고 찜목록과 검색을 저장하세요.'
                  }}
                </p>
              </div>
              <Transition name="fade-lift" mode="out-in">
                <LoginForm v-if="mode === 'login'" key="login" @submit="handleLogin" />
                <RegisterForm v-else key="register" @submit="handleRegister" />
              </Transition>
            </div>
          </Transition>
          <div class="card-shadow"></div>
          <div class="light-bar" :class="mode"></div>
        </div>

        <p class="switch-tip" v-if="mode === 'login'">
          처음이신가요? 오른쪽 탭으로 전환하면 회원가입 플로우가 바로 펼쳐집니다.
        </p>
        <p class="switch-tip" v-else>
          이미 계정이 있다면 로그인 탭으로 돌아가 빠르게 진입하세요.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import LoginForm from '@/components/auth/LoginForm.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
import { login as loginAuth, register as registerAuth } from '@/utils/auth';

const mode = ref<'login' | 'register'>('login');
const router = useRouter();

const handleLogin = async (payload: { email: string; password: string; keepLogin: boolean }) => {
  const result = loginAuth(payload.email, payload.password, payload.keepLogin);
  alert(result.message);
  if (result.ok) {
    await router.push('/');
  }
};

const handleRegister = (payload: {
  email: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
}) => {
  const result = registerAuth(payload.email, payload.password);
  alert(result.message);
  if (result.ok) {
    mode.value = 'login';
  }
};
</script>

<style scoped>
.auth-page {
  position: relative;
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px 80px;
  overflow: hidden;
  transition: background 0.4s ease;
}

.auth-page.login {
  background: radial-gradient(120% 120% at 10% 10%, rgba(229, 9, 20, 0.08), transparent 40%),
    #0b0c14;
}

.auth-page.register {
  background: radial-gradient(120% 120% at 90% 20%, rgba(0, 200, 160, 0.08), transparent 40%),
    #0b0c14;
}

.bg-aurora {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 70, 120, 0.12), transparent 35%),
    radial-gradient(circle at 80% 0%, rgba(120, 90, 255, 0.14), transparent 30%),
    radial-gradient(circle at 50% 100%, rgba(0, 200, 255, 0.12), transparent 25%);
  filter: blur(6px);
  z-index: 0;
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 120px 120px;
  opacity: 0.35;
  mix-blend-mode: screen;
}

.grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}

.scanlines {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 100% 6px;
  opacity: 0.3;
  mix-blend-mode: screen;
}

.orb {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.55;
  animation: float 18s ease-in-out infinite;
}
.orb-1 {
  top: 10%;
  left: 4%;
  background: rgba(255, 60, 120, 0.35);
}
.orb-2 {
  bottom: 12%;
  right: 12%;
  background: rgba(90, 150, 255, 0.35);
  animation-delay: 2s;
}
.orb-3 {
  top: 32%;
  right: 32%;
  background: rgba(0, 220, 190, 0.3);
  animation-delay: 4s;
}

.auth-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 26px;
  width: min(1100px, 100%);
  background: rgba(12, 14, 24, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
}

.hero {
  position: relative;
  padding: 14px;
  display: grid;
  gap: 16px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: #dce5ff;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
}

.hero h1 {
  margin: 4px 0 0;
  font-size: clamp(1.8rem, 2.4vw, 2.4rem);
}

.hero .lede {
  margin: 4px 0 0;
  color: #c0c9e3;
  max-width: 480px;
}

.hero-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(200px, 1fr));
  gap: 14px;
  margin-top: 10px;
}

.glow-card {
  position: relative;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: radial-gradient(circle at 20% 20%, rgba(255, 80, 120, 0.08), transparent 60%),
    rgba(255, 255, 255, 0.04);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.glow-card::after {
  content: '';
  position: absolute;
  inset: -40%;
  background: conic-gradient(
    from 120deg,
    rgba(255, 80, 120, 0.08),
    rgba(90, 150, 255, 0.08),
    rgba(0, 220, 190, 0.08),
    rgba(255, 80, 120, 0.08)
  );
  filter: blur(30px);
  opacity: 0.7;
  z-index: 0;
  animation: rotateSlow 16s linear infinite;
}

.glow-card > * {
  position: relative;
  z-index: 1;
}

.glow-card.secondary {
  background: radial-gradient(circle at 80% 0%, rgba(90, 150, 255, 0.1), transparent 70%),
    rgba(255, 255, 255, 0.04);
}

.glow-card h3 {
  margin: 4px 0;
}

.glow-card .mini {
  margin: 0;
  color: #b7c1dc;
}

.form-stage {
  position: relative;
  display: grid;
  gap: 16px;
}

.mode-toggle {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 4px;
  overflow: hidden;
}

.toggle-pill {
  position: absolute;
  inset: 4px;
  width: calc(50% - 4px);
  background: linear-gradient(135deg, rgba(255, 80, 120, 0.18), rgba(90, 150, 255, 0.18));
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  transition: transform 0.45s cubic-bezier(0.3, 0.7, 0.3, 1), background 0.3s ease;
}

.toggle-pill.login {
  transform: translateX(0);
}

.toggle-pill.register {
  transform: translateX(100%);
  background: linear-gradient(135deg, rgba(0, 200, 160, 0.24), rgba(120, 90, 255, 0.2));
}

.toggle-btn {
  position: relative;
  z-index: 1;
  height: 44px;
  border: none;
  background: transparent;
  color: #cfd6eb;
  font-weight: 700;
  cursor: pointer;
  border-radius: 10px;
  transition: color 0.2s ease;
}

.toggle-btn.active {
  color: #fff;
}

.card-stage {
  position: relative;
  perspective: 1200px;
  padding-top: 10px;
}

.card-stack {
  position: absolute;
  inset: 12px 18px;
  pointer-events: none;
}

.card-ghost {
  position: absolute;
  inset: 0;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.04);
  filter: blur(1px);
}

.card-ghost.layer-1 {
  transform: translateY(18px) scale(0.97);
  opacity: 0.35;
}

.card-ghost.layer-2 {
  transform: translateY(10px) scale(0.985);
  opacity: 0.5;
}

.card-ghost.layer-3 {
  transform: translateY(4px);
  opacity: 0.8;
}

.form-card {
  position: relative;
  background: linear-gradient(180deg, rgba(18, 20, 30, 0.96), rgba(12, 14, 22, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 26px 22px 28px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.04);
  transform-origin: center;
  overflow: hidden;
  isolation: isolate;
}

.form-card::before {
  content: '';
  position: absolute;
  inset: -40% -20%;
  background: conic-gradient(
    from 200deg,
    rgba(229, 9, 20, 0.15),
    rgba(0, 200, 160, 0.12),
    rgba(120, 90, 255, 0.12),
    rgba(229, 9, 20, 0.15)
  );
  filter: blur(40px);
  opacity: 0.65;
  z-index: 0;
  animation: rotateSlow 14s linear infinite;
}

.form-card > * {
  position: relative;
  z-index: 1;
}

.form-card.login {
  animation: tiltIn 0.65s cubic-bezier(0.3, 0.7, 0.3, 1);
}
.form-card.register {
  animation: tiltInReverse 0.65s cubic-bezier(0.3, 0.7, 0.3, 1);
}

.form-header h1 {
  margin: 6px 0 8px;
}

.form-header .lede {
  margin: 0;
  color: #c0c9e3;
}

.eyebrow-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-chip {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #f6f7ff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
}

.status-chip.login {
  background: linear-gradient(135deg, rgba(229, 9, 20, 0.22), rgba(255, 90, 90, 0.16));
}

.status-chip.register {
  background: linear-gradient(135deg, rgba(0, 200, 160, 0.22), rgba(120, 90, 255, 0.16));
}

.floating-tip {
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 12px;
  color: #cbd3ee;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.floating-tip.register {
  background: linear-gradient(135deg, rgba(0, 200, 160, 0.06), rgba(255, 255, 255, 0.02));
}

.floating-tip.login {
  background: linear-gradient(135deg, rgba(229, 9, 20, 0.06), rgba(255, 255, 255, 0.02));
}

.card-shadow {
  position: absolute;
  inset: 20px 18px -14px;
  border-radius: 20px;
  background: radial-gradient(ellipse at 50% 0%, rgba(229, 9, 20, 0.16), transparent 60%);
  filter: blur(12px);
  z-index: 0;
  pointer-events: none;
}

.light-bar {
  position: absolute;
  inset: 10px 18px auto;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 80, 120, 0.6), rgba(90, 150, 255, 0.6));
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.4));
  opacity: 0.8;
}

.light-bar.register {
  background: linear-gradient(90deg, rgba(0, 200, 160, 0.65), rgba(120, 90, 255, 0.6));
}

.switch-tip {
  margin: 0 6px;
  color: #9aa6c8;
  font-size: 0.95rem;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 12px;
  color: #9aa6c8;
}

.fade-lift-enter-active,
.fade-lift-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-lift-enter-from,
.fade-lift-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.99);
}

.deck-enter-active {
  animation: stackSlideIn 0.55s cubic-bezier(0.3, 0.7, 0.3, 1);
}
.deck-leave-active {
  animation: stackSlideOut 0.45s ease forwards;
}

@media (max-width: 1024px) {
  .auth-shell {
    grid-template-columns: 1fr;
    padding: 26px 18px;
    gap: 18px;
  }

  .hero {
    padding: 8px;
  }

  .hero-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .auth-shell {
    padding: 22px 14px;
  }

  .card-stack {
    display: none;
  }

  .form-card {
    padding: 22px 18px;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-18px);
  }
}

@keyframes rotateSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes tiltIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98) rotateX(-8deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg);
  }
}

@keyframes tiltInReverse {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98) rotateX(8deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg);
  }
}

@keyframes stackSlideIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes stackSlideOut {
  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
}
</style>
