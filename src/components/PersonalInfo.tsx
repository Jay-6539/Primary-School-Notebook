import { useMemo } from 'react'

const PersonalInfo = () => {
  const age = useMemo(() => {
    const today = new Date()
    const birthDate = new Date(2019, 1, 5) // February 5, 2019 (month is 0-indexed)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }, [])

  const infoItems = [
    { label: 'Name', value: 'LIU Hei Yuen Aiden' },
    { label: 'Age', value: `${age} years old` },
    { label: 'Birthday', value: '5th February, 2019' },
    { label: 'Primary School', value: 'St. Paul College Primary School' },
    { label: 'Class', value: 'Junior 1C' },
    { label: 'Student Number', value: '17' },
    { label: 'School Bus', value: '4E' },
    { label: 'Home', value: 'Seaside Sonata' },
    { label: 'Hobbies', value: 'Drawing, Reading books' },
  ]

  return (
    <div className="personal-info">
      <div className="info-card">
        <h2>About Aiden</h2>
        <div className="info-grid">
          {infoItems.map((item, index) => (
            <div key={index} className="info-item">
              <span className="info-label">{item.label}:</span>
              <span className="info-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PersonalInfo

