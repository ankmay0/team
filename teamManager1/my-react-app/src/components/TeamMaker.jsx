import { useState, useEffect } from 'react';
import FileHandler from './FileHandler.jsx';
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import  DropDownBox  from './DropDownBox.jsx';

const TeamMaker = ({ teams }) => {
  const [memberSkillSelections, setMemberSkillSelections] = useState({});
  const [skillsList, setSkillsList] = useState([]);
  const [uploadedDataContent, setUploadedDataContent] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState([]);

  // const [openAddDialog, setOpenAddDialog] = useState(false);
  // const [newExpertise, setNewExpertise] = useState('');
  // const [newExperience, setNewExperience] = useState('');
  // const [pendingTeamMember, setPendingTeamMember] = useState({ teamId: '', memberId: '' });
  const [isChecked, setIsChecked] = useState(false);


  const handleDataUpload = (uploaded) => {
    setUploadedDataContent(uploaded);
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch("https://raw.githubusercontent.com/ankmay0/teamManager1/main/my-react-app/public/SkillsData.json");
        const result = await res.json();
        setSkillsList(result);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      }
    };
    fetchSkills();
  }, []);

  function handleSkillChange(teamId, memberId, skillId) {
    setMemberSkillSelections(prev => {
      const newSelections = { ...prev };
      if (!newSelections[teamId]) {
        newSelections[teamId] = {};
      }
      newSelections[teamId][memberId] = skillId;
      return newSelections;
    });
  }

  function handleCheckboxChange(pairingIdentifier) {
    console.log(selectedTeams)
    if (isChecked) {
      setSelectedTeams(prev => prev.filter(id => id !== pairingIdentifier));
    } else {
      setSelectedTeams(prev => [...prev, pairingIdentifier]);
    }
    setIsChecked(!isChecked);
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, border: '1px solid', borderColor: grey[400], borderRadius: 8 }}>
      <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom sx={{ mt: 7, mb: 4, textAlign: 'center' }}>
        Team Skill Assignment
      </Typography>

      <Box sx={{ mb: 4 }}>
        {teams?.length ? (
          <FormGroup>
            {teams.map((team, index) => {
              const pairingIdentifier = `Pairing-${index}`;
              

              return (
                <Box key={pairingIdentifier} sx={{ py: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    
                    <Checkbox
                      onChange={() => handleCheckboxChange(pairingIdentifier)}
                    />
                    <DropDownBox
                      teamId={team.srcId}
                      teamName={team.srcName}
                      isChecked={isChecked}
                      pairingIdentifier={pairingIdentifier}
                      memberSkillSelections={memberSkillSelections}
                      handleSkillChange={handleSkillChange}
                      filteredSkills={skillsList.filter(skill => skill.employeeId === team.srcId)}
                      skillsList={skillsList}
                      setSkillsList ={setSkillsList}
                      setMemberSkillSelections= {setMemberSkillSelections}
                      // setOpenAddDialog={setOpenAddDialog}
                      // setPendingTeamMember={setPendingTeamMember}
                    />
                      <DropDownBox
                      teamId={team.targetId}
                      teamName={team.targetName}
                      isChecked={isChecked}
                      pairingIdentifier={pairingIdentifier}
                      memberSkillSelections={memberSkillSelections}
                      handleSkillChange={handleSkillChange}
                      filteredSkills={skillsList.filter(skill => skill.employeeId === team.targetId)}
                      skillsList={skillsList}
                      setSkillsList ={setSkillsList}
                      // setOpenAddDialog={setOpenAddDialog}
                      // setPendingTeamMember={setPendingTeamMember}
                    />
                  </Grid>
                  <Divider sx={{ mt: 4, borderColor: 'rgb(178, 176, 239)', borderBottomWidth: 2 }} />
                </Box>
              );
            })}
          </FormGroup>
        ) : (
          <Typography sx={{ textAlign: 'center', mt: 2 }}>
            No team data available.
          </Typography>
        )}
      </Box>

      <FileHandler
        selections={Object.fromEntries(selectedTeams.map(key => [key, memberSkillSelections[key]]))}
        data={uploadedDataContent}
        onDataUpload={handleDataUpload}
      />


      {/* <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Expertise</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Expertise"
            fullWidth
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Experience"
            fullWidth
            value={newExperience}
            onChange={(e) => setNewExperience(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              const newSkill = {
                id: `${Date.now()}`,
                employeeId: pendingTeamMember.memberId,
                expertise: newExpertise,
                experience: newExperience
              };


              try {
                await fetch('https://raw.githubusercontent.com/ankmay0/teamManager1/main/my-react-app/public/SkillsData.json', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newSkill)
                });
              } catch (err) {
                console.error('Error adding new skill:', err);
              }

              const alreadyExists = skillsList.some(skill =>
                skill.employeeId === pendingTeamMember.memberId &&
                skill.expertise.trim().toLowerCase() === newExpertise.trim().toLowerCase() &&
                skill.experience.trim().toLowerCase() === newExperience.trim().toLowerCase()
              );

              if (alreadyExists) {
                alert("Skill with the same expertise and experience already exists for this member.");
                return;
              }

              setSkillsList(prev => [...prev, newSkill]);

              handleSkillChange(pendingTeamMember.teamId, pendingTeamMember.memberId, newSkill.id);

              setOpenAddDialog(false);
              setNewExpertise('');
              setNewExperience('');
              setPendingTeamMember({ teamId: '', memberId: '' });
            }}
            disabled={!newExpertise || !newExperience}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog> */}
    </Container>
  );
};

export default TeamMaker;
