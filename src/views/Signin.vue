<template>
  <section class="auth-page">
    <div class="panel-wrapper" :class="{ 'show-register': mode === 'register' }">
      <div class="panel login-panel">
        <div class="panel-header">
          <p class="eyebrow">Welcome</p>
          <h1>로그인</h1>
          <p class="lede">로그인 후 옌플릭스를 누리세요!</p>
        </div>
        <Transition name="slide-fade" mode="out-in">
          <LoginForm key="login" @submit="handleLogin" />
        </Transition>
      </div>

      <div class="panel register-panel">
        <div class="panel-header">
          <p class="eyebrow">Join us</p>
          <h1>회원가입</h1>
          <p class="lede">계정을 만들고 찜 목록과 검색을 저장하세요.</p>
        </div>
        <Transition name="slide-fade" mode="out-in">
          <RegisterForm key="register" @submit="handleRegister" />
        </Transition>
      </div>

      <div class="switcher">
        <div class="switcher-card">
          <div class="switcher-content" v-if="mode === 'login'">
            <h3>새 계정이 필요하신가요?</h3>
            <p>TMDB API 키를 준비했다면 1분 만에 가입 완료!</p>
            <button @click="mode = 'register'">회원가입으로 이동</button>
          </div>
          <div class="switcher-content" v-else>
            <h3>이미 계정이 있나요?</h3>
            <p>로그인하여 홈으로 이동하세요.</p>
            <button @click="mode = 'login'">로그인으로 이동</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';

const mode = ref<'login' | 'register'>('login');

const handleLogin = (payload: { email: string; password: string; keepLogin: boolean }) => {
  console.log('login submit', payload);
  // TODO: 실제 로그인 로직 연결
};

const handleRegister = (payload: {
  email: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
}) => {
  console.log('register submit', payload);
  // TODO: 실제 회원가입 로직 연결
};
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px 48px;
}

.panel-wrapper {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 420px));
  gap: 0;
  width: min(960px, 100%);
  background: rgba(12, 14, 22, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

.panel {
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: radial-gradient(circle at 20% 10%, rgba(255, 61, 90, 0.08), transparent 30%),
    radial-gradient(circle at 80% 0%, rgba(123, 109, 255, 0.08), transparent 28%),
    rgba(12, 14, 22, 0.9);
  transition: opacity 0.3s ease;
}

.login-panel {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.register-panel {
  border-left: 1px solid rgba(255, 255, 255, 0.05);
}

.panel-header h1 {
  margin: 4px 0 6px;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 12px;
  color: #9aa6c8;
}

.lede {
  margin: 0;
  color: #c0c9e3;
}

.switcher {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.switcher-card {
  width: 50%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 61, 90, 0.2), rgba(123, 109, 255, 0.2));
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 24px;
  transition: transform 0.4s ease;
  pointer-events: auto;
}

.switcher-content {
  text-align: center;
  display: grid;
  gap: 10px;
}

.switcher-content h3 {
  margin: 0;
}

.switcher-content p {
  margin: 0;
  color: #d2d8ec;
}

.switcher-content button {
  margin-top: 6px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.switcher-content button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.12);
}

.panel-wrapper.show-register .switcher-card {
  transform: translateX(-100%);
}

.panel-wrapper.show-register .login-panel {
  opacity: 0.32;
}

.panel-wrapper:not(.show-register) .register-panel {
  opacity: 0.32;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 900px) {
  .panel-wrapper {
    grid-template-columns: 1fr;
  }

  .login-panel,
  .register-panel {
    border: none;
  }

  .switcher {
    position: static;
    width: 100%;
  }

  .switcher-card {
    width: 100%;
    transform: translateX(0) !important;
  }

  .panel-wrapper.show-register .login-panel,
  .panel-wrapper:not(.show-register) .register-panel {
    opacity: 1;
  }
}
</style>
