export type UserType = {
 u_id: string,
 name: string,
 email: string,
 photo: string,
 role: "admin" | "user",
 gender: "male" | "female",
 dob: Date,
 createdAt: Date,
 updatedAt: Date,
 // virtual attribute
 age: number
}
