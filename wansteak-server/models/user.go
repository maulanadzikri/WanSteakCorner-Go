package models

type User struct {
	ID uint `json:"id" gorm:"primaryKey"`
	Email string `json:"email" gorm:"unique"`
	Password string `json:"password"`
	Role string `json:"role"`
}

// Sanitize: Cleans sensitive data before the Users is sent as a JSON Response
func (u *User) Sanitize() {
	u.Password = ""
}