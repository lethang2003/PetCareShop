export const baseURL = "http://localhost:5001";

const SummaryApi = {
  register: {
    url: "/api/v1/auth/register",
    method: "post",
  },
  login: {
    url: "/api/v1/auth/login",
    method: "post",
  },
  forgotPassword: {
    url: "/api/v1/auth/forgot-password",
    method: "POST",
  },
  verifyEmail: (token: string) => ({
    url: `/api/v1/auth/verify-email?token=${token}`,
    method: "get",
  }),
  googleLogin: {
    url: "/api/v1/auth/google-login",
    method: "post",
  },
  refreshToken: {},
  upload: {
    uploadImage: {
      url: "/api/v1/upload/upload-image",
      method: "post",
    },
  },
  getAllService: {
    url: "/api/v1/service/view-service",
    method: "get",
  },
  getServicesByClinic: (clinicId: string) => ({
    url: `/api/v1/service/view-service-by-clinic/${clinicId}`,
    method: "get",
  }),
  changePassword: () => ({
    url: "/api/v1/auth/change-password",
    method: "post",
  }),

  services: {
    getAll: {
      url: "/api/v1/service/view-service",
      method: "get",
    },
    getById: (id: string) => ({
      url: `/api/v1/service/view-detail-service/${id}`,
      method: "get",
    }),
    create: {
      url: "/api/v1/service/create-service",
      method: "post",
    },
    update: (id: string) => ({
      url: `/api/v1/service/update-service/${id}`,
      method: "put",
    }),
    delete: (id: string) => ({
      url: `/api/v1/service/delete-service/${id}`,
      method: "delete",
    }),
  },

  //clinic
  clinics: {
    getAllClinics: {
      url: "/api/v1/clinic/getall",
      method: "get",
    },
    createClinic: {
      url: "/api/v1/clinic/create-clinic",
      method: "post",
    },
    getClinicById: {
      url: (id: string) => `/api/v1/clinic/get-clinic-detail/${id}`,
      method: "get",
    },
    updateClinic: {
      url: (id: string) => `/api/v1/clinic/update-clinic/${id}`,
      method: "put",
    },
    getDoctorsByClinic: (clinicId: string) => ({
      url: `/api/v1/clinic/${clinicId}/doctors`,
      method: "get",
    }),
  },

  createPetCustomer: {
    url: "/api/v1/pets/create-pet-customer",
    method: "post",
  },
  createPetDoctor: {
    url: "/api/v1/pets/create-pet-doctor",
    method: "post",
  },
  getAllPetsCustomer: ({
    url: `/api/v1/pets/view-all-pet-customer`,
    method: "get",
  }),
  getAllPetsDoctor: {
    url: `/api/v1/pets/view-all-pet-doctor`,
    method: "get",
  },

  getPetById: {
    url: "/pet-detail",
    method: "get",
  },
  updatePetCustomer: (id: string) => ({
    url: `/api/v1/pets/update-pet-customer/${id}`,
    method: "put",
  }),
  updatePetDoctor: (id: string) => ({
    url: `/api/v1/pets/update-pet-doctor/${id}`,
    method: "put",
  }),
  deletePetCustomer: (id: string) => ({
    url: `/api/v1/pets/delete-pet/${id}`,
    method: "put",
  }),
  getAllPets: {
    url: "/api/v1/pets/viewallpet",
    method: "get",
  },

  updatePet: (id: string) => ({
    url: `/api/v1/pets/update/${id}`,
    method: "put",
  }),
  deletePet: (id: string) => ({
    url: `/api/v1/pets/delete/${id}`,
    method: "delete",
  }),

  schedules: {
    getAll: {
      url: "/api/v1/schedules/getall",
      method: "get",
    },
    create: {
      url: "/api/v1/schedules/create-schedule",
      method: "post",
    },
    update: (id: string) => ({
      url: `/api/v1/schedules/update-schedule/${id}`,
      method: "put",
    }),
    delete: (id: string) => ({
      url: `/api/v1/schedules/delete-schedule/${id}`,
      method: "delete",
    }),
    getAvailableScheduleDoctor: {
      url: "/api/v1/schedules/available-schedules",
      method: "get",
    },
    registerWord: {
      url: "/api/v1/schedules/register-schedule",
      method: "post",
    },
    getMyScheduleDoctor: {
      url: "/api/v1/schedules/my-schedule-doctor",
      method: "get",
    },
    getSwappableSchedules: (id: string) => ({
      url: `/api/v1/schedules/swappable-schedules/${id}`,
      method: "get",
    }),
  },
  userDetails: (userId: string) => ({
    url: `/api/v1/users/get-users-detail/${userId}`,
    method: "get",
  }),
  forumPost: {
    getById: (id: string) => ({
      url: `/api/v1/forum-posts/view-detail-post/${id}`,
      method: "get",
    }),
    getAll: {
      url: "/api/v1/forum-posts/view-forum-post",
      method: "get",
    },
    create: {
      url: "/api/v1/forum-posts/create-post",
      method: "post",
    },
    update: (id: string) => ({
      url: `/api/v1/forum-posts/update-post/${id}`,
      method: "put",
    }),
    delete: (id: string) => ({
      url: `/api/v1/forum-posts/delete-post/${id}`,
      method: "delete",
    }),
    getStatistics: {
      url: "/api/v1/forum-posts/statistics-forum",
      method: "get",
    },
    react: (postId: string) => ({
      url: `/api/v1/forum-posts/reaction-post/${postId}`,
      method: "post",
    }),
    share: (postId: string) => ({
      url: `/api/v1/forum-posts/share-post/${postId}`,
      method: "post",
    }),
  },
  knowledgePost: {
    getAll: {
      url: "/api/v1/forum-posts/view-knowledge-post",
      method: "get",
    },
    getById: (id: string) => ({
      url: `/api/v1/forum-posts/view-detail-post-knowledge/${id}`,
      method: "get",
    }),
  },
  comment: {
    getByPostId: (postId: string) => ({
      url: `/api/v1/comment/view-comments/${postId}`,
      method: "get",
    }),
    create: (postId: string) => ({
      url: `/api/v1/comment/create-comment/${postId}`,
      method: "post",
    }),
    react: (commentId: string) => ({
      url: `/api/v1/comment/reaction-comment/${commentId}`,
      method: "post",
    }),
    update: (commentId: string) => ({
      url: `/api/v1/comment/update-comment/${commentId}`,
      method: "put",
    }),
    delete: (commentId: string) => ({
      url: `/api/v1/comment/delete-comment/${commentId}`,
      method: "delete",
    }),
  },
  updateProfile: (userId: string) => ({
    method: "PUT",
    url: `/api/v1/users/update-profile/${userId}`,
  }),

  workScheduleTransfer: {
    create: {
      url: "/api/v1/schedule-transfer/create-transfer",
      method: "post",
    },
    getMine: {
      url: "/api/v1/schedule-transfer/my-transfer",
      method: "get",
    },
    accept: (id: string) => ({
      url: `/api/v1/schedule-transfer/${id}/accept-transfer`,
      method: "put",
    }),
    reject: (id: string) => ({
      url: `/api/v1/schedule-transfer/${id}/reject-transfer`,
      method: "put",
    }),
  },


  updateProduct: (id: string) => ({
    url: `/api/v1/products/${id}`,
    method: "put",
  }),

   createProduct: {
    url: "/api/v1/products/create-product",
    method: "post",
  },

  deleteProduct: (id: string) => ({
    url: `/api/v1/products/${id}`,
    method: "delete",
  }),

  createAppointment: {
    url: "/api/v1/appointments/create-appointment",
    method: "post",
  },
  checkAppointmentAvailability: {
    url: "/api/v1/appointments/check-appointment-availability",
    method: "post",
  },
  viewAppointments: {
    url: "/api/v1/appointments/view-appointment",
    method: "get",
  },
  viewDetailAppointment: (appointmentId: string) => ({
    url: `/api/v1/appointments/view-detail-appointment/${appointmentId}`,
    method: "get",
  }),
  cancelAppointment: (appointmentId: string) => ({
    url: `/api/v1/appointments/cancel-appointment/${appointmentId}`,
    method: "put",
  }),
  //User
  user: {
    getAllUsers: {
      url: "/api/v1/users/get-all-users",
      method: "get",
    },
    blockUnblockUser: {
      url: "/api/v1/users/block/:userId/unblock",
      method: "PATCH",
    },
    createUserAccount: {
      url: "/api/v1/users/create-user-account",
      method: "post",
    },
  },

  payment: {
    verifyVnpayReturn: {
      url: "/api/v1/payment/vnpay-return-appointment",
      method: "get",
    },
  },
  //Review
  review: {
    getAll: {
      url: "/api/v1/review/view-review",
      method: "get",
    },
    create: {
      url: "/api/v1/review",
      method: "post",
    },
    getDoctorReviews: (doctorId: string) => ({
      url: `/api/v1/review/doctor/${doctorId}`,
      method: "get",
    }),
    getServiceReviews: (serviceId: string) => ({
      url: `/api/v1/review/service/${serviceId}`,
      method: "get",
    }),
  },

  nearbyClinics: (lat: number, lng: number) => ({
  url: `/api/v1/clinic/nearby?lat=${lat}&lng=${lng}`,
  method: "get",
}),

};
export default SummaryApi;
