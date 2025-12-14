<template>
  <form class="auth-form" @submit.prevent="onSubmit">
    <div class="field">
      <label for="login-email">이메일</label>
      <input
        id="login-email"
        v-model="email"
        type="email"
        name="email"
        autocomplete="email"
        placeholder="you@example.com"
        required
      />
    </div>

    <div class="field">
      <label for="login-password">비밀번호</label>
      <input
        id="login-password"
        v-model="password"
        type="password"
        name="password"
        autocomplete="current-password"
        placeholder="발급받은 TMDB API 키"
        required
      />
    </div>

    <div class="form-footer">
      <label class="checkbox">
        <input v-model="keepLogin" type="checkbox" />
        <span>로그인 유지</span>
      </label>
      <button type="submit">로그인</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  submit: [{ email: string; password: string; keepLogin: boolean }];
}>();

const email = ref('');
const password = ref('');
const keepLogin = ref(false);

const onSubmit = () => {
  emit('submit', {
    email: email.value.trim(),
    password: password.value.trim(),
    keepLogin: keepLogin.value,
  });
};
</script>

<style scoped>
.auth-form {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 6px;
}

label {
  font-size: 0.95rem;
  color: #cfd6eb;
}

input[type='email'],
input[type='password'] {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f8f9fc;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input[type='email']:focus,
input[type='password']:focus {
  border-color: #e50914;
  box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.18);
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #c0c9e3;
  font-size: 0.95rem;
  cursor: pointer;
}

.checkbox input {
  width: 16px;
  height: 16px;
  accent-color: #e50914;
}

button[type='submit'] {
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ff3b3b, #e50914 70%, #ff6a6a);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(229, 9, 20, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button[type='submit']:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(229, 9, 20, 0.45);
}
</style>
