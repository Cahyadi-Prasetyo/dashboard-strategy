<script lang="ts" setup>
import type { HTMLAttributes } from "vue";

const { user, clear } = useUserSession();
// Define custom user type
// interface UserRole {
//   id: number;
//   name: string;
// }

// interface UnitKerja {
//   id: number;
//   nama: string;
// }

// interface CustomUser {
//   id: number;
//   email: string;
//   username: string;
//   nama: string;
//   nama_instansi: string;
//   roles: UserRole[];
//   unit_kerja: UnitKerja | null;
// }

// Data contoh untuk UI
// const user = ref<CustomUser>({
//   id: 1,
//   email: "john.doe@example.com",
//   username: "johndoe",
//   nama: "John Doe",
//   nama_instansi: "PT Example Indonesia",
//   roles: [
//     { id: 1, name: "admin" },
//     { id: 2, name: "user" },
//   ],
//   unit_kerja: {
//     id: 1,
//     nama: "IT Department",
//   },
// });

// Get initials dari nama untuk avatar
const getInitials = (nama?: string) => {
  if (!nama) return "U";

  const names = nama.split(" ").filter(Boolean);

  if (names.length >= 2) {
    const firstInitial = names[0]?.[0] ?? "";
    const secondInitial = names[1]?.[0] ?? "";
    const initials = (firstInitial + secondInitial).toUpperCase();
    return initials || "U";
  }

  const trimmed = nama.trim();
  if (!trimmed) return "U";

  return trimmed.slice(0, 2).toUpperCase();
};

// Handler untuk logout
const router = useRouter();
const toast = useToast();

const handleLogout = async () => {
  try {
    if (user.value?.type === "internal") {
      await clear()
      window.location.href = "/api/auth/logout/sso";
    } else {
      await $fetch("/api/auth/logout", { method: "POST" });
    }
    
    toast.add({
      title: "Logout berhasil",
      description: "Anda telah berhasil keluar dari sistem",
      icon: "i-heroicons-check-circle",
      color: "success",
    });

    setTimeout(() => {
      router.push("/login");
    }, 500);
  } catch (err) {
    console.error(err);
    toast.add({
      title: "Logout gagal",
      description: "Silakan coba lagi",
      color: "error",
    });
  }
};

const userMenu = computed(() => [
  [
    {
      type: "label",
      label: user.value?.nama || "User",
      slot: "username" as const,
    },
  ],
  [
    // {
    //   label: (user.value as any)?.roles?.join(", ") || "User",
    //   icon: "ph:gear-duotone",
    // },
    {
      label: "Log out",
      icon: "ph:power",
      color: "error",
      onSelect() {
        handleLogout();
      },
    },
  ],
]);

const props = defineProps<{
  class?: HTMLAttributes["class"];
  sideOffset?: number;
}>();
</script>

<template>
  <UDropdownMenu
    class="group"
    size="md"
    :items="userMenu"
    :content="{
      align: 'end',
      side: 'bottom',
      sideOffset: sideOffset ? sideOffset : 10,
      alignOffset: 0,
    }"
    :ui="{
      content: 'w-60 z-[10001] bg-white shadow-lg',
      // item: 'hover:bg-primary-100',
      itemLabel: 'text-gray-900 font-small',
      // itemLeadingIcon: 'text-gray-700 group-hover:text-primary',
      // label: 'text-gray-900 font-semibold text-sm',
    }"
    :popper="{
      strategy: 'fixed',
      placement: 'bottom-end',
    }"
  >
    <button type="button" class="focus:outline-none">
      <UAvatar
        :alt="user?.nama || 'User'"
        size="lg"
        :class="[
          'text-[14px] text-white bg-primary hover:bg-primary/80 hover:cursor-pointer',
          '[&>span]:text-white [&>span]:w-full [&>span]:h-full',
          '[&>span]:flex [&>span]:items-center [&>span]:justify-center',
          props.class,
        ]"
        :ui="{
          fallback: 'text-white text-sm font-semibold',
        }"
        :src="user?.foto || undefined"
      >
        {{ user?.foto ?? getInitials(user?.nama) }}
      </UAvatar>
    </button>

    <template #username>
      <div class="flex items-center gap-2 px-2 py-2">
        <UAvatar
          :alt="user?.nama || 'User'"
          size="xs"
          class="text-[10px] bg-primary text-white"
          :ui="{
            fallback: 'text-white text-[10px] font-semibold',
          }"
          :src="user?.foto || undefined"
        >
          {{ user?.foto ?? getInitials(user?.nama) }}
        </UAvatar>
        <span class="text-sm font-semibold text-gray-900">
          {{ user?.nama || "Loading..." }}
        </span>
      </div>
    </template>
  </UDropdownMenu>
</template>
