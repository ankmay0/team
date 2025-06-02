import { useState } from 'react';
import {
    Typography,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Autocomplete,
} from '@mui/material';

function DropDownBox({ teamId, teamName, isChecked, pairingIdentifier, memberSkillSelections, handleSkillChange, filteredSkills, skillsList, setSkillsList, setMemberSkillSelections }) {

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newExpertise, setNewExpertise] = useState('');
    const [newExperience, setNewExperience] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);

    return (
        <>
            {/* fetch team.source id, source name and team.targetid and target name */}
            <Typography> {teamName}</Typography>
            <Autocomplete
                disabled={!isChecked}
                options={filteredSkills}
                getOptionLabel={(option) =>
                    typeof option === 'string'
                        ? option
                        : `${option.expertise}`
                    // : `${option.expertise} (${option.experience})`
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={
                    filteredSkills.find(skill => skill.id === memberSkillSelections[pairingIdentifier]?.[teamId]) || null
                }
                onChange={(event, newValue) => {
                    if (newValue === null) return;

                    if (newValue === 'add_new') {
                        setOpenAddDialog(true);
                        // setPendingTeamMember({ teamId: pairingIdentifier, memberId: teamId });
                    } else {
                        handleSkillChange(pairingIdentifier, teamId, newValue.id);
                    }
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Select Expertise"
                        variant="outlined"
                        fullWidth
                        sx={{ minWidth: 400 }}
                    />
                )}
                renderOption={(props, option) => {
                    if (option === 'add_new') {
                        return (
                            <li {...props} style={{ fontWeight: 'bold', borderTop: '1px solid #ccc', marginTop: 5 }}>
                                ➕ Add New Expertise
                            </li>
                        );
                    }

                    return (
                        <li {...props}>
                            <Box sx={{ display: 'flex', width: '100%' }}>
                                <Box sx={{ width: '50%', fontWeight: 'bold' }}>{option.expertise}</Box>
                                <Box sx={{ width: '50%', color: 'text.secondary' }}>{option.experience}</Box>
                            </Box>
                        </li>
                    );
                }}
                filterOptions={(options, state) => {
                    const filtered = options.filter(option =>
                        option.expertise.toLowerCase().includes(state.inputValue.toLowerCase())
                    );

                    return [...filtered, 'add_new'];
                }}
            />
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
                <DialogTitle>Add New Expertise</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Expertise"
                        fullWidth
                        onChange={(e) => setNewExpertise(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Experience"
                        fullWidth
                        onChange={(e) => setNewExperience(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                    <Button
                        onClick={async () => {
                            const newSkill = {
                                id: `${Date.now()}`,
                                employeeId: teamId,
                                expertise: newExpertise,
                                experience: newExperience
                            };

                            const alreadyExists = skillsList.find((item) => item.expertise === newSkill.expertise   );

                            console.log(alreadyExists);
                            


                            if (alreadyExists) {
                                alert("Skill with the same expertise and experience already exists for this member.");
                                return;
                            }
                            
                            setSkillsList(prev => [newSkill, ...prev]);
                            setMemberSkillSelections(newSkill);

                            // handleSkillChange(pendingTeamMember.teamId, pendingTeamMember.memberId, newSkill.id);

                            setOpenAddDialog(false);
                            // setPendingTeamMember({ teamId: '', memberId: '' });
                        }}
                        // disabled={!newExpertise || !newExperience}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
}

export default DropDownBox;
