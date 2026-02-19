export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "HKids API",
    version: "0.2.0",
    description:
      "Role-based backend for ADMIN CMS, PARENT family portal, and CHILD distraction-free reader."
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Token"
      }
    },
    schemas: {
      RegisterInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "Parent One" },
          email: { type: "string", format: "email", example: "parent@hkids.local" },
          password: { type: "string", format: "password", example: "StrongPass123!" },
          role: { type: "string", enum: ["PARENT", "ADMIN"], example: "PARENT" },
          bootstrapKey: { type: "string", example: "admin_bootstrap_key" }
        },
        required: ["name", "email", "password"]
      },
      LoginInput: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "parent@hkids.local" },
          password: { type: "string", format: "password", example: "StrongPass123!" }
        },
        required: ["email", "password"]
      },
      ChildPinLoginInput: {
        type: "object",
        properties: {
          childId: { type: "string", example: "65fd0b4d9d5a2206d4d4f123" },
          pin: { type: "string", example: "1234" }
        },
        required: ["childId", "pin"]
      },
      AgeGroupInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "Early Readers" },
          minAge: { type: "integer", example: 5 },
          maxAge: { type: "integer", example: 7 },
          description: { type: "string", example: "Books for beginner readers" },
          sortOrder: { type: "integer", example: 1 },
          isActive: { type: "boolean", example: true }
        },
        required: ["name", "minAge", "maxAge"]
      },
      CategoryInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "Animals" },
          description: { type: "string", example: "Animal stories" },
          sortOrder: { type: "integer", example: 1 },
          isActive: { type: "boolean", example: true }
        },
        required: ["name"]
      },
      ChildInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "Lina" },
          age: { type: "integer", example: 6 },
          avatar: { type: "string", format: "uri", example: "https://example.com/avatar.png" },
          ageGroupId: { type: "string", example: "65fd0b4d9d5a2206d4d4f555" },
          pin: { type: "string", example: "1234" }
        },
        required: ["name", "age"]
      },
      ChildPolicyInput: {
        type: "object",
        properties: {
          allowedCategoryIds: {
            type: "array",
            items: { type: "string", example: "65fd0b4d9d5a2206d4d4f777" }
          },
          allowedAgeGroupIds: {
            type: "array",
            items: { type: "string", example: "65fd0b4d9d5a2206d4d4f555" }
          },
          dailyLimitMinutes: { type: "integer", example: 20 },
          schedule: {
            type: "object",
            properties: {
              start: { type: "string", example: "18:00" },
              end: { type: "string", example: "20:00" }
            }
          }
        }
      },
      BookPageInput: {
        type: "object",
        properties: {
          pageNumber: { type: "integer", example: 1 },
          title: { type: "string", example: "Page One" },
          text: { type: "string", example: "Story text..." },
          imageUrl: { type: "string", format: "uri" },
          narrationUrl: { type: "string", format: "uri" }
        },
        required: ["pageNumber", "text"]
      },
      BookInput: {
        type: "object",
        properties: {
          title: { type: "string", example: "A Friendly Whale" },
          summary: { type: "string", example: "A sea adventure." },
          coverImageUrl: { type: "string", format: "uri" },
          ageGroupId: { type: "string", example: "65fd0b4d9d5a2206d4d4f555" },
          categoryIds: { type: "array", items: { type: "string" } },
          pages: { type: "array", items: { $ref: "#/components/schemas/BookPageInput" } },
          tags: { type: "array", items: { type: "string" } },
          visibility: { type: "string", enum: ["private", "public"] }
        },
        required: ["title", "ageGroupId"]
      },
      ReviewInput: {
        type: "object",
        properties: {
          isApproved: { type: "boolean", example: true }
        },
        required: ["isApproved"]
      },
      ReorderPagesInput: {
        type: "object",
        properties: {
          orderedPageNumbers: {
            type: "array",
            items: { type: "integer" },
            example: [3, 1, 2]
          }
        },
        required: ["orderedPageNumbers"]
      },
      StartReadingInput: {
        type: "object",
        properties: {
          bookId: { type: "string", example: "65fd0b4d9d5a2206d4d4f901" }
        },
        required: ["bookId"]
      },
      ReadingProgressInput: {
        type: "object",
        properties: {
          sessionId: { type: "string", example: "65fd0b4d9d5a2206d4d4f902" },
          pageIndex: { type: "integer", example: 5 }
        },
        required: ["sessionId", "pageIndex"]
      },
      EndReadingInput: {
        type: "object",
        properties: {
          sessionId: { type: "string", example: "65fd0b4d9d5a2206d4d4f902" }
        },
        required: ["sessionId"]
      }
    }
  },
  paths: {
    "/health": {
      get: { tags: ["Health"], summary: "Health check", responses: { "200": { description: "OK" } } }
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user (defaults to PARENT, ADMIN with controls)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterInput" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user (ADMIN/PARENT)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } }
        },
        responses: { "200": { description: "Authenticated" } }
      }
    },
    "/auth/child/pin": {
      post: {
        tags: ["Auth"],
        summary: "Child PIN login",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ChildPinLoginInput" } }
          }
        },
        responses: { "200": { description: "Authenticated child" } }
      }
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated profile",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Current profile" } }
      }
    },
    "/age-groups/public": {
      get: { tags: ["Age Groups"], summary: "List active age groups", responses: { "200": { description: "OK" } } }
    },
    "/age-groups": {
      get: {
        tags: ["Age Groups"], 
        summary: "Admin list age groups",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Age Groups"],
        summary: "Admin create age group",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AgeGroupInput" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/age-groups/{id}": {
      patch: {
        tags: ["Age Groups"],
        summary: "Admin update age group",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AgeGroupInput" } } }
        },
        responses: { "200": { description: "Updated" } }
      },
      delete: {
        tags: ["Age Groups"],
        summary: "Admin delete age group",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Deleted" } }
      }
    },
    "/categories/public": {
      get: { tags: ["Categories"], summary: "List active categories", responses: { "200": { description: "OK" } } }
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Admin list categories",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Categories"],
        summary: "Admin create category",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryInput" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/categories/{id}": {
      patch: {
        tags: ["Categories"],
        summary: "Admin update category",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryInput" } } }
        },
        responses: { "200": { description: "Updated" } }
      },
      delete: {
        tags: ["Categories"],
        summary: "Admin delete category",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Deleted" } }
      }
    },
    "/books": {
      get: {
        tags: ["Books"],
        summary: "Admin list books",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Books"],
        summary: "Admin create book",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/BookInput" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/books/{id}": {
      get: {
        tags: ["Books"],
        summary: "Admin get book by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } }
      },
      patch: {
        tags: ["Books"],
        summary: "Admin update book",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/BookInput" } } }
        },
        responses: { "200": { description: "Updated" } }
      },
      delete: {
        tags: ["Books"],
        summary: "Admin delete book",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Deleted" } }
      }
    },
    "/books/{id}/review": {
      patch: {
        tags: ["Books"],
        summary: "Admin approve/revoke book",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewInput" } } }
        },
        responses: { "200": { description: "Updated" } }
      }
    },
    "/books/{id}/pages/reorder": {
      patch: {
        tags: ["Books"],
        summary: "Admin reorder book pages",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ReorderPagesInput" } }
          }
        },
        responses: { "200": { description: "Reordered" } }
      }
    },
    "/books/{id}/publish": {
      patch: {
        tags: ["Books"],
        summary: "Admin publish book",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Published" } }
      }
    },
    "/books/{id}/unpublish": {
      patch: {
        tags: ["Books"],
        summary: "Admin unpublish book",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Unpublished" } }
      }
    },
    "/uploads/image": {
      post: {
        tags: ["Uploads"],
        summary: "Admin upload image",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: { file: { type: "string", format: "binary" } },
                required: ["file"]
              }
            }
          }
        },
        responses: { "201": { description: "Uploaded" } }
      }
    },
    "/parent/children": {
      get: {
        tags: ["Parent"],
        summary: "Parent list children",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK" } }
      },
      post: {
        tags: ["Parent"],
        summary: "Parent create child profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ChildInput" } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/parent/children/{id}": {
      get: {
        tags: ["Parent"],
        summary: "Parent get child profile",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } }
      },
      patch: {
        tags: ["Parent"],
        summary: "Parent update child profile",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ChildInput" } } }
        },
        responses: { "200": { description: "Updated" } }
      },
      delete: {
        tags: ["Parent"],
        summary: "Parent delete child profile",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Deleted" } }
      }
    },
    "/parent/children/{id}/policy": {
      get: {
        tags: ["Parent"],
        summary: "Parent get child policy",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } }
      },
      patch: {
        tags: ["Parent"],
        summary: "Parent update child policy",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ChildPolicyInput" } }
          }
        },
        responses: { "200": { description: "Updated" } }
      }
    },
    "/parent/children/{id}/analytics": {
      get: {
        tags: ["Parent"],
        summary: "Parent analytics per child",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/kids/books": {
      get: {
        tags: ["Kids"],
        summary: "Child library with server-enforced policy",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/kids/books/{id}": {
      get: {
        tags: ["Kids"],
        summary: "Child book details if allowed",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "403": { description: "Not allowed" } }
      }
    },
    "/kids/books/{id}/pages": {
      get: {
        tags: ["Kids"],
        summary: "Child book pages if allowed",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "403": { description: "Not allowed" } }
      }
    },
    "/kids/books/{id}/resume": {
      get: {
        tags: ["Kids"],
        summary: "Child resume state for a specific book",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Resume state" }, "403": { description: "Not allowed" } }
      }
    },
    "/kids/reading/start": {
      post: {
        tags: ["Kids"],
        summary: "Start or resume reading session",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/StartReadingInput" } }
          }
        },
        responses: { "201": { description: "Started" } }
      }
    },
    "/kids/reading/progress": {
      post: {
        tags: ["Kids"],
        summary: "Track reading progress",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ReadingProgressInput" } }
          }
        },
        responses: { "200": { description: "Updated" } }
      }
    },
    "/kids/reading/end": {
      post: {
        tags: ["Kids"],
        summary: "End reading session",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/EndReadingInput" } } }
        },
        responses: { "200": { description: "Ended" } }
      }
    },
    "/admin/analytics/overview": {
      get: {
        tags: ["Admin"],
        summary: "Admin overview analytics",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/admin/analytics/reading": {
      get: {
        tags: ["Admin"],
        summary: "Admin reading analytics by date",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK" } }
      }
    },
    "/admin/analytics/books/top": {
      get: {
        tags: ["Admin"],
        summary: "Admin top books analytics",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK" } }
      }
    }
  }
};
