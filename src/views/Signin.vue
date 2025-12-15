<template>
  <section class="auth-page" :class="[mode, curtainState]">
    <div class="starfield">
      <span class="stars layer-1"></span>
      <span class="stars layer-2"></span>
      <span class="stars layer-3"></span>
      <div class="grain"></div>
    </div>

    <div class="stage-wrap">
      <div class="stage-topper">
        <div class="stage-title">
        </div>
        <div class="stage-lights">
          <span class="beam left"></span>
          <span class="beam right"></span>
        </div>
      </div>
      <div class="hero-outside">
        <div class="hero">
          <div class="pill">RED CURTAIN ENTRANCE</div>
          <h1>TMDB API로 입장, 레드카펫처럼 반짝이게.</h1>
          <p class="lede">
            로그인 후 여러분의 무대를 누리세요!
          </p>
        </div>
      </div>

      <div class="stage">
        <div class="curtain" :class="curtainState">
          <div class="curtain-valance"></div>
          <div class="curtain-panel left">
            <div class="fold"></div>
            <div class="fold"></div>
            <div class="fold"></div>
            <div class="fold"></div>
          </div>
          <div class="curtain-panel right">
            <div class="fold"></div>
            <div class="fold"></div>
            <div class="fold"></div>
            <div class="fold"></div>
          </div>
        </div>

        <div class="stage-screen" :class="{ 'is-hidden': curtainState !== 'open' }">
          <div class="screen-glow"></div>
          <div class="screen-grid"></div>
          <div class="screen-noise"></div>

          <div class="auth-shell">
            <div class="form-stage">
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
                            : '계정만 만들면 찜목록과 검색을 한 번에 가져옵니다.'
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
            </div>
          </div>
        </div>
      </div>

      <div class="stage-controls">
        <div class="control-copy">
          <h3>무대 아래에서 대기 중</h3>
          <p>커튼을 열어 로그인/회원가입 스크린을 확인하세요.</p>
        </div>
        <div class="control-buttons">
          <button class="control-btn primary" type="button" @click="startExperience('login')">
            로그인하기
          </button>
          <button class="control-btn ghost" type="button" @click="startExperience('register')">
            회원가입하기
          </button>
        </div>
        <p class="hint">
          회원가입이 끝나면 커튼이 잠시 닫혔다가 자동으로 다시 열려 로그인 화면을 보여줍니다.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import LoginForm from '@/components/auth/LoginForm.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
import { login as loginAuth, register as registerAuth } from '@/utils/auth';

const CURTAIN_DURATION = 700;

const mode = ref<'login' | 'register'>('login');
const curtainState = ref<'closed' | 'opening' | 'open' | 'closing'>('closed');

const router = useRouter();
const authStore = useAuthStore();

const openCurtain = () => {
  if (curtainState.value === 'open' || curtainState.value === 'opening') return;
  curtainState.value = 'opening';
  window.setTimeout(() => {
    curtainState.value = 'open';
  }, CURTAIN_DURATION);
};

const closeCurtain = (onClosed?: () => void) => {
  if (curtainState.value === 'closed' || curtainState.value === 'closing') {
    onClosed?.();
    return;
  }
  curtainState.value = 'closing';
  window.setTimeout(() => {
    curtainState.value = 'closed';
    onClosed?.();
  }, CURTAIN_DURATION);
};

const startExperience = (nextMode: 'login' | 'register') => {
  const triggerOpen = () => {
    mode.value = nextMode;
    openCurtain();
  };

  if (curtainState.value === 'open' || curtainState.value === 'opening') {
    closeCurtain(() => {
      mode.value = nextMode;
      window.setTimeout(() => openCurtain(), 160);
    });
  } else {
    triggerOpen();
  }
};

const reopenForLogin = () => {
  closeCurtain(() => {
    mode.value = 'login';
    window.setTimeout(() => {
      openCurtain();
    }, 260);
  });
};

const handleLogin = async (payload: { email: string; password: string; keepLogin: boolean }) => {
  const result = loginAuth(payload.email, payload.password, payload.keepLogin);
  alert(result.message);
  if (result.ok) {
    authStore.setAuth({ isLoggedIn: true, userId: payload.email, keepLogin: payload.keepLogin });
    authStore.setTmdbKey(payload.password);
    sessionStorage.setItem('nf_session_active', '1');
    closeCurtain(async () => {
      await router.push('/');
    });
  }
};

const handleRegister = async (payload: {
  email: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
}) => {
  const result = registerAuth(payload.email, payload.password);
  alert(result.message);
  if (result.ok) {
    authStore.setUsers([...authStore.users, { id: payload.email, password: payload.password }]);
    authStore.setAuth({ ...authStore.auth, isLoggedIn: false, userId: payload.email, keepLogin: false });
    reopenForLogin();
  }
};
</script>

<style scoped>
.auth-page {
  position: relative;
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px 86px;
  overflow: hidden;
  transition: background 0.4s ease;
  background: #0b0c14;
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

.stage-wrap {
  position: relative;
  z-index: 1;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  display: grid;
  gap: 16px;
  padding-inline: 8px;
}

.stage-topper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 6px;
}

.stage-title {
  display: grid;
  gap: 6px;
  width: 100%;
}

.stage-lede {
  margin: 0;
  color: #c0c9e3;
  font-size: 0.95rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stage-lights {
  position: relative;
  height: 20px;
  min-width: 140px;
}

.stage-lights .beam {
  position: absolute;
  inset: 0;
  width: 42%;
  background: linear-gradient(90deg, rgba(229, 9, 20, 0.35), transparent 70%);
  filter: blur(18px);
  opacity: 0.9;
}
.stage-lights .beam.right {
  right: 0;
  left: auto;
  background: linear-gradient(270deg, rgba(229, 9, 20, 0.35), transparent 70%);
}

.hero-outside {
  position: relative;
  border-radius: 26px;
  padding: 18px 18px 10px;
  margin: 0 auto;
  width: 100%;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.45);
}

.stage {
  position: relative;
  width: 100%;
  margin: 0 auto;
  border-radius: 28px;
  overflow: hidden;
  background: radial-gradient(circle at 10% 10%, rgba(255, 80, 120, 0.05), transparent 40%),
    radial-gradient(circle at 90% 10%, rgba(0, 200, 160, 0.04), transparent 36%),
    linear-gradient(160deg, rgba(12, 14, 24, 0.96), rgba(10, 10, 16, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.03);
  padding: 26px 18px;
  isolation: isolate;
}

.stage::after {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 22px;
  border: 1px dashed rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.stage-screen {
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  transition: opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease;
  z-index: 2;
}

.stage-screen.is-hidden {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
  filter: saturate(0.4) blur(2px);
  pointer-events: none;
}

.screen-glow {
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle, rgba(229, 9, 20, 0.16), transparent 55%),
    radial-gradient(circle at 80% 30%, rgba(90, 150, 255, 0.12), transparent 50%),
    radial-gradient(circle at 50% 80%, rgba(0, 200, 160, 0.12), transparent 45%);
  filter: blur(30px);
  z-index: 0;
}

.screen-grid {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.02) 0px,
      rgba(255, 255, 255, 0.02) 1px,
      transparent 1px,
      transparent 32px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.02) 0px,
      rgba(255, 255, 255, 0.02) 1px,
      transparent 1px,
      transparent 32px
    );
  z-index: 0;
}

.screen-noise {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 100% 5px;
  mix-blend-mode: screen;
  opacity: 0.6;
  z-index: 0;
}

.curtain {
  position: absolute;
  inset: -6px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  pointer-events: none;
  z-index: 4;
}

.curtain-valance {
  position: absolute;
  left: -12px;
  right: -12px;
  top: 0;
  height: 68px;
  background: linear-gradient(180deg, #a90000 0%, #7a0000 100%);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.36);
  border-bottom: 4px solid rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.curtain-panel {
  position: relative;
  width: 52%;
  background: radial-gradient(circle at 20% 20%, rgba(255, 120, 120, 0.18), transparent 55%),
    linear-gradient(135deg, #9d0000 0%, #6d0000 50%, #4d0000 100%);
  box-shadow: inset -4px 0 16px rgba(0, 0, 0, 0.35), 0 12px 28px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  transition: transform 0.7s cubic-bezier(0.77, 0.03, 0.21, 1);
}

.curtain-panel.left {
  border-radius: 22px 0 0 22px;
  transform: translateX(0%);
}

.curtain-panel.right {
  border-radius: 0 22px 22px 0;
  transform: translateX(0%);
}

.curtain-panel .fold {
  position: absolute;
  inset: 0;
  width: 28%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12), transparent 60%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0));
  opacity: 0.25;
}

.curtain-panel .fold:nth-child(1) {
  left: 8%;
}
.curtain-panel .fold:nth-child(2) {
  left: 28%;
}
.curtain-panel .fold:nth-child(3) {
  left: 48%;
}
.curtain-panel .fold:nth-child(4) {
  left: 68%;
}

.curtain.open .curtain-panel.left,
.curtain.opening .curtain-panel.left {
  transform: translateX(-105%);
}

.curtain.open .curtain-panel.right,
.curtain.opening .curtain-panel.right {
  transform: translateX(105%);
}

.curtain.closing .curtain-panel.left,
.curtain.closed .curtain-panel.left {
  transform: translateX(0);
}
.curtain.closing .curtain-panel.right,
.curtain.closed .curtain-panel.right {
  transform: translateX(0);
}

.auth-shell {
  position: relative;
  z-index: 1;
  display: block;
  width: min(760px, 100%);
  background: rgba(12, 14, 24, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  margin: 0 auto;
}

.hero {
  position: relative;
  padding: 14px;
  display: grid;
  gap: 16px;
  text-align: center;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  justify-content: center;
  width: 100%;
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
  font-size: clamp(1.6rem, 4vw, 2.4rem);
}

.hero .lede {
  margin: 4px 0 0;
  color: #c0c9e3;
  max-width: 720px;
  margin-inline: auto;
  font-size: clamp(0.95rem, 2.6vw, 1.05rem);
}

.hero-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(200px, 1fr));
  gap: 14px;
  margin-top: 10px;
  max-width: 920px;
  margin-inline: auto;
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

.stage-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
}

.control-copy h3 {
  margin: 0 0 4px;
}

.control-copy p,
.hint {
  margin: 0;
  color: #b4bfdc;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-btn {
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.control-btn.primary {
  background: linear-gradient(135deg, #ff3b3b, #e50914 70%, #ff6a6a);
  border-color: rgba(255, 255, 255, 0.18);
}

.control-btn.ghost {
  background: rgba(255, 255, 255, 0.08);
}

.control-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.2);
}

.control-btn:active {
  transform: translateY(0);
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
  .stage-wrap,
  .hero-outside,
  .stage {
    width: min(100%, 960px);
    padding-inline: 10px;
  }

  .auth-shell {
    padding: 26px 18px;
  }

  .hero {
    padding: 8px;
  }

  .hero-cards {
    grid-template-columns: 1fr;
  }

  .stage-controls {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}

@media (max-width: 720px) {
  .stage-wrap,
  .hero-outside,
  .stage {
    width: 100%;
    padding-inline: 12px;
  }

  .auth-shell {
    padding: 22px 18px;
  }

  .card-stack {
    display: none;
  }

  .form-card {
    padding: 22px 18px;
  }

  .stage-controls {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .control-buttons {
    width: 100%;
    flex-wrap: wrap;
  }

  .control-btn {
    flex: 1;
    text-align: center;
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
