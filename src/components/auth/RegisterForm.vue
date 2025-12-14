<template>
  <form class="auth-form" @submit.prevent="onSubmit">
    <div class="field">
      <label for="register-email">이메일</label>
      <input
        id="register-email"
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
      <label for="register-password">비밀번호</label>
      <input
        id="register-password"
        v-model="password"
        type="password"
        name="password"
        autocomplete="new-password"
        placeholder="발급받은 TMDB API 키"
        required
        @blur="validatePassword"
      />
      <p v-if="errors.password" class="error">{{ errors.password }}</p>
    </div>

    <div class="field">
      <label for="register-password-confirm">비밀번호 확인</label>
      <input
        id="register-password-confirm"
        v-model="passwordConfirm"
        type="password"
        name="passwordConfirm"
        autocomplete="new-password"
        placeholder="다시 입력"
        required
        @blur="validatePasswordConfirm"
      />
      <p v-if="errors.passwordConfirm" class="error">{{ errors.passwordConfirm }}</p>
    </div>

    <div class="form-footer">
      <label class="checkbox">
        <input v-model="agreeTerms" type="checkbox" @change="validateTerms" />
        <span>약관에 동의합니다</span>
      </label>
      <button type="submit" :disabled="!isValid">회원가입</button>
    </div>
    <p v-if="errors.agreeTerms" class="error terms-error">{{ errors.agreeTerms }}</p>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

const emit = defineEmits<{
  submit: [
    {
      email: string;
      password: string;
      passwordConfirm: string;
      agreeTerms: boolean;
    },
  ];
}>();

const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const agreeTerms = ref(false);

const errors = reactive<{
  email: string | null;
  password: string | null;
  passwordConfirm: string | null;
  agreeTerms: string | null;
}>({
  email: null,
  password: null,
  passwordConfirm: null,
  agreeTerms: null,
});

const emailPattern = /^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/;

const validateEmail = () => {
  const value = email.value.trim();
  if (!value) {
    errors.email = '이메일을 입력하세요.';
  } else if (!emailPattern.test(value)) {
    errors.email = '이메일 형식이 올바르지 않습니다.';
  } else {
    errors.email = null;
  }
};

const validatePassword = () => {
  const value = password.value.trim();
  if (!value) {
    errors.password = 'TMDB API 키를 입력하세요.';
  } else {
    errors.password = null;
  }
  validatePasswordConfirm();
};

const validatePasswordConfirm = () => {
  const value = passwordConfirm.value.trim();
  if (!value) {
    errors.passwordConfirm = 'TMDB API 키 확인을 입력하세요.';
  } else if (value !== password.value.trim()) {
    errors.passwordConfirm = 'TMDB API 키가 일치하지 않습니다.';
  } else {
    errors.passwordConfirm = null;
  }
};

const validateTerms = () => {
  errors.agreeTerms = agreeTerms.value ? null : '약관에 동의해야 합니다.';
};

const isValid = computed(() => {
  return (
    email.value.trim().length > 0 &&
    password.value.trim().length > 0 &&
    passwordConfirm.value.trim().length > 0 &&
    agreeTerms.value &&
    !errors.email &&
    !errors.password &&
    !errors.passwordConfirm &&
    !errors.agreeTerms &&
    emailPattern.test(email.value.trim()) &&
    passwordConfirm.value.trim() === password.value.trim()
  );
});

const onSubmit = () => {
  validateEmail();
  validatePassword();
  validatePasswordConfirm();
  validateTerms();
  if (!isValid.value) return;

  emit('submit', {
    email: email.value.trim(),
    password: password.value.trim(),
    passwordConfirm: passwordConfirm.value.trim(),
    agreeTerms: agreeTerms.value,
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

.error {
  margin: 0;
  font-size: 0.85rem;
  color: #ff7f7f;
}

.terms-error {
  margin-top: -4px;
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
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

button[type='submit']:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(229, 9, 20, 0.45);
}

button[type='submit']:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
