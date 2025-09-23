# Dummy Leave Types Data Summary

## 📊 **Data Insertion Complete**

Successfully inserted **51 dummy leave types** into the database for testing purposes.

## 📈 **Statistics**

### **Total Records:** 51

### **Payment Status Distribution:**
- **Paid Leave Types:** 44 (86.3%)
- **Unpaid Leave Types:** 7 (13.7%)

### **Frequency Type Distribution:**
- **Limited Per Lifetime:** 44 (86.3%)
- **Monthly:** 1 (2.0%)
- **Once Per Lifetime:** 6 (11.8%)

### **Proof Requirements:**
- **Requires Proof:** 43 (84.3%)
- **No Proof Required:** 8 (15.7%)

## 🏷️ **Leave Type Categories**

### **Core Leave Types (Based on Requirements):**
1. **Sickness Leave** - 35 days/year, paid, requires proof
2. **Day Off** - 2 days/month, paid, accumulates
3. **Educational Leave** - 1-15 days paid, 16+ unpaid
4. **Mirage Leave** - 14 days, once per lifetime
5. **Maternity Leave** - 51 days, once per lifetime
6. **Giving Birth Leave** - 21 days, once per lifetime
7. **Hajj & Umrah Leave** - 20 days, once per lifetime

### **Additional Test Categories:**
- Emergency Leave
- Bereavement Leave
- Personal Leave
- Training Leave
- Conference Leave
- Jury Duty Leave
- Military Leave
- Sabbatical Leave
- Adoption Leave
- Paternity Leave
- Compassionate Leave
- Study Leave
- Volunteer Leave
- Religious Leave
- Medical Leave
- Mental Health Leave
- Work Injury Leave
- Family Emergency Leave
- Weather Emergency Leave
- Quarantine Leave
- Voting Leave
- Union Leave
- Research Sabbatical
- Extended Maternity/Paternity Leave
- Various Sick Leave Types
- Rehabilitation Leave
- Domestic Violence Leave
- Organ Donor Leave
- Foster Care Leave
- Disaster Relief Leave
- Blood Donor Leave
- Court Witness Leave
- Sick Child Leave
- Elder Care Leave
- Pregnancy Complications Leave
- Workplace Accommodation Leave
- Sick Family Member Leave
- Extended Bereavement Leave
- Extended Mental Health Leave
- Work Stress Leave
- Chronic Illness Leave
- Preventive Care Leave

## 🔧 **Technical Details**

### **Database Schema Compliance:**
- All records follow the LeaveType schema
- Proper enum values used for frequency.type
- Boolean values correctly set for requires_proof
- All required fields populated

### **Files Created:**
- `DUMMY_LEAVE_TYPES_DATA.json` - Raw data file
- `insert_dummy_leave_types.js` - Insertion script
- `check_leave_types.js` - Verification script

### **Database Connection:**
- MongoDB Atlas cluster: `dof.uspodzr.mongodb.net`
- Collection: `leavetypes`
- All records successfully inserted and verified

## 🧪 **Testing Ready**

The database now contains comprehensive test data covering:
- Various leave scenarios
- Different payment statuses
- Multiple frequency patterns
- Proof requirements
- Edge cases and special circumstances

This data can be used for:
- API endpoint testing
- Frontend UI testing
- Business logic validation
- Performance testing
- Integration testing

## 📝 **Sample Records**

```
1. Sickness Leave - Proof: true - Payment: paid - Freq: limited_per_lifetime
2. Day Off - Proof: false - Payment: paid - Freq: monthly  
3. Educational Leave - Proof: true - Payment: paid - Freq: limited_per_lifetime
4. Mirage Leave - Proof: true - Payment: paid - Freq: once_per_lifetime
5. Maternity Leave - Proof: true - Payment: paid - Freq: once_per_lifetime
```

**Status: ✅ Complete and Ready for Testing**
