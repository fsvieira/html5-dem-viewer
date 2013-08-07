#define CPL_DEBUG ON
#include <gdal/gdal_priv.h>
#include <gdal/cpl_conv.h> // for CPLMalloc()
#include <gdal/cpl_string.h>
#include <iostream>
#include <ostream>
#include <istream>
#include <string>
#include <sstream>
#include <fstream>
#include <map>
#include <stdlib.h>

int main(int argc, char *argv[]){
	GDALDataset  *poDataset;
	GDALAllRegister();
	
	if(argc != 3){
		std::cout << "usage:\n" << argv[0] << " src_file dest_file\n";
		exit(0);  
	}
	
	const std::string name = argv[1]; 
	const std::string destName = argv[2]; 

	poDataset = (GDALDataset *) GDALOpen(name.c_str(), GA_ReadOnly );

	if( poDataset == NULL ){
	   std::cout << "Failed to open " << name << "\n"; 
	}else{
		const char *pszFormat =  "GTiff";
		char **papszMetadata;

		GDALDriver *poDriver;

		poDriver = GetGDALDriverManager()->GetDriverByName(pszFormat);

		if( poDriver == NULL ){
			std::cout << "Cant open driver\n"; 
			exit(1);       
		}
		
		papszMetadata = GDALGetMetadata(poDriver, NULL);
		if( !CSLFetchBoolean(papszMetadata, GDAL_DCAP_CREATE, FALSE)){
			std::cout << "Create Method not suported!\n";
		}
		
		if( !CSLFetchBoolean( papszMetadata, GDAL_DCAP_CREATECOPY, FALSE ) ){
			std::cout << "CreateCopy() method not suported.\n";
		}  

		char **papszOptions = NULL;

	  std::cout << "Reading file " << name << "\n"; 
	  std::cout << "x= " << poDataset->GetRasterXSize()
							 << ", h=" << poDataset->GetRasterYSize() <<
							 ", bands= " << poDataset->GetRasterCount() << "\n";
	
	  GDALRasterBand *data; 
    data = poDataset->GetRasterBand(1);   
	    
       
    GDALDataType type = data->GetRasterDataType(); 
    
    int size = data->GetXSize()*data->GetYSize();
		
	  std::cout << "size=" << size << " , w*h = " << poDataset->GetRasterXSize()*poDataset->GetRasterYSize() << "\n";

    float *buffer;
    buffer = (float *) CPLMalloc(sizeof(float)*size);
    data->RasterIO(GF_Read, 0, 0, data->GetXSize(), data->GetYSize(), buffer, data->GetXSize(), data->GetYSize(), GDT_Float32, 0, 0 );
       
       // Metadata, 
     double geot[6]; 
     poDataset->GetGeoTransform(geot); 
       
     unsigned int i;
     float max=0, min=0; 
       
     for(i=0; i<size; i++){
			 if(max < buffer[i]){
				 max = buffer[i];
			 }
				
			 if(min > buffer[i]){
			 	 min = buffer[i]; 
			 }
	   }
       
     float range = max - min; 
     std::cout << "range=" << range << ", max=" << max << ", min=" << min << "\n";  
     std::map<float, unsigned int> counter;  

		 std::fstream json(destName.c_str(), std::ios::trunc | std::ios::out);
		 json << "{\"w\":" << poDataset->GetRasterXSize() << ",\"h\":" << poDataset->GetRasterXSize() << ",\"data\":[";
     for(i=0; i<size; i++){
		   float value = buffer[i];
			 json << value;
			 if (i!=size-1) {
				json << ",";
			 }
	   }

		 json << "]}"; 

		 json.close();
		 GDALClose(poDataset);

		 std::string cmd = "bzip2 " + destName;
		 system(cmd.c_str());
	}
    
  exit(0); 
}


