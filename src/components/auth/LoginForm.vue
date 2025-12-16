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
        @blur="validateEmail"
      />
      <p v-if="errors.email" class="error">{{ errors.email }}</p>
    </div>

    <div class="field">
      <label for="login-password">비밀번호</label>
      <input
        id="login-password"
        v-model="password"
        type="password"
        name="password"
        autocomplete="current-password"
        placeholder="TMDB API 키를 입력해 주세요."
        required
        @blur="validatePassword"
      />
      <p v-if="errors.password" class="error">{{ errors.password }}</p>
    </div>

    <div class="form-footer">
      <div class="checkboxes">
        <label class="checkbox">
          <input v-model="keepLogin" type="checkbox" />
          <span>로그인 유지</span>
        </label>
        <label class="checkbox">
          <input v-model="saveEmail" type="checkbox" />
          <span>이메일 저장</span>
        </label>
      </div>
      <button type="submit" :disabled="!isValid">로그인</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { STORAGE_KEYS } from '@/constants/storage';

const emit = defineEmits<{
  submit: [{ email: string; password: string; keepLogin: boolean; saveEmail: boolean }];
}>();

const email = ref('');
const password = ref('');
const keepLogin = ref(false);
const saveEmail = ref(false);

const errors = reactive<{ email: string | null; password: string | null }>({
  email: null,
  password: null,
});

const emailPattern = /^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/;

const validateEmail = () => {
  const value = email.value.trim();
  if (!value) {
    errors.email = '이메일을 입력해 주세요.';
  } else if (!emailPattern.test(value)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  } else {
    errors.email = null;
  }
};

const validatePassword = () => {
  const value = password.value.trim();
  if (!value) {
    errors.password = 'TMDB API 키를 입력해 주세요.';
  } else {
    errors.password = null;
  }
};

const isValid = computed(() => {
  return (
    email.value.trim().length > 0 &&
    password.value.trim().length > 0 &&
    !errors.email &&
    !errors.password &&
    emailPattern.test(email.value.trim())
  );
});

const onSubmit = () => {
  validateEmail();
  validatePassword();
  if (!isValid.value) return;

  if (saveEmail.value) {
    localStorage.setItem(STORAGE_KEYS.savedLoginEmail, email.value.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.savedLoginEmail);
  }

  emit('submit', {
    email: email.value.trim(),
    password: password.value.trim(),
    keepLogin: keepLogin.value,
    saveEmail: saveEmail.value,
  });
};

onMounted(() => {
  const storedEmail = localStorage.getItem(STORAGE_KEYS.savedLoginEmail);
  if (storedEmail) {
    email.value = storedEmail;
    saveEmail.value = true;
  }
});
</script>

<style scoped>
.auth-form {
  display: grid;
  gap: 12px;
  width: 100%;
}

.field {
  display: grid;
  gap: 5px;
  width: 100%;
}

label {
  font-size: clamp(0.82rem, 0.74vw, 0.9rem);
  color: #cfd6eb;
}

input[type='email'],
input[type='password'] {
  width: 100%;
  padding: clamp(8px, 0.7vw, 11px) clamp(9px, 0.82vw, 13px);
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f8f9fc;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-size: clamp(0.82rem, 0.8vw, 0.9rem);
}

input[type='email']:focus,
input[type='password']:focus {
  border-color: #e50914;
  box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.18);
}

.error {
  margin: 0;
  font-size: 0.85rem;
  color: #ff7f7f;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.checkboxes {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #c0c9e3;
  font-size: clamp(0.82rem, 0.74vw, 0.9rem);
  cursor: pointer;
}

.checkbox input {
  width: 18px;
  height: 18px;
  accent-color: #e50914;
}

button[type='submit'] {
  padding: clamp(7px, 0.68vw, 10px) clamp(10px, 0.8vw, 14px);
  border-radius: 8px;
  border: none;
  background: #e50914;
  color: #fff;
  font-weight: 700;
  font-size: clamp(0.82rem, 0.8vw, 0.9rem);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

button[type='submit']:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(229, 9, 20, 0.45);
}

button[type='submit']:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
