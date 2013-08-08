#define CPL_DEBUG ON
#include <gdal/gdal_priv.h>
#include <gdal/cpl_conv.h> // for CPLMalloc()
#include <gdal/cpl_string.h>
#include <iostream>
#include <ostream>
#include <istream>
#include <string>
#include <sstream>
#include <map>

void printDataType(GDALDataType type); 

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
		
		const char *pszFormat = "GTiff";
		GDALDriver *poDriver;
		char **papszMetadata;

		poDriver = GetGDALDriverManager()->GetDriverByName(pszFormat);

		if( poDriver == NULL ){
			std::cout << "Cant open driver\n"; 
			exit(1);       
		}
		
		papszMetadata = GDALGetMetadata( poDriver, NULL );
		if( !CSLFetchBoolean( papszMetadata, GDAL_DCAP_CREATE, FALSE ) ){
			std::cout << "Create Method not suported!\n";
		}
		
		if( !CSLFetchBoolean( papszMetadata, GDAL_DCAP_CREATECOPY, FALSE ) ){
			std::cout << "CreateCopy() method not suported.\n";
		}  
		

		
		char **papszOptions = NULL;


		GDALDataset *dest = poDriver->Create(destName.c_str() , poDataset->GetRasterXSize(), 
					poDataset->GetRasterYSize(), 3, GDT_Byte, papszOptions );
		
		
		
				
	   std::cout << "Reading file " << name << "\n"; 
	   std::cout << 
		"x= " << poDataset->GetRasterXSize() << 
		", h=" << poDataset->GetRasterYSize() << 
        ", bands= " <<   poDataset->GetRasterCount() << "\n";
	
	   
	   
	   GDALRasterBand *data; 
       data = poDataset->GetRasterBand(1);   
	    
       
       GDALDataType type = data->GetRasterDataType(); 
       printDataType(type); 
       
       int size = data->GetXSize()*data->GetYSize();
		
	   std::cout << "size=" << size << " , w*h = " << poDataset->GetRasterXSize()*poDataset->GetRasterYSize() << "\n";

       float *buffer;
       buffer = (float *) CPLMalloc(sizeof(float)*size);
       data->RasterIO(GF_Read, 0, 0, data->GetXSize(), data->GetYSize(), buffer, data->GetXSize(), data->GetYSize(), GDT_Float32, 0, 0 );

	   GDALRasterBand *destBand1 = dest->GetRasterBand(1);   
	   GDALRasterBand *destBand2 = dest->GetRasterBand(2);   
	   GDALRasterBand *destBand3 = dest->GetRasterBand(3);   
	   // GDALRasterBand *destBand4 = dest->GetRasterBand(4);   


	   
       
       // Metadata, 
       double geot[6]; 
       poDataset->GetGeoTransform(geot); 
	   dest->SetGeoTransform(geot);// adfGeoTransform );
	   dest->SetProjection( poDataset->GetProjectionRef() );
       
       
       
       
       GByte destWrite1[size]; //  = (GUInt32 *) CPLMalloc(sizeof(GUInt32)*size); 
       GByte destWrite2[size];
       GByte destWrite3[size];
      //  GByte destWrite4[size];
       
       
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
       for(i=0; i<size; i++){
			 counter[buffer[i]]++;
			 unsigned int v = buffer[i] * 100;
	  	 destWrite1[i] = (v & (0xff << 0)) >> 0;
	  	 destWrite2[i] = (v & (0xff << 8)) >> 8;
	  	 destWrite3[i] = (v & (0xff << 16)) >> 16;
	  	   //  destWrite4[i] =  0x00; // (v & (0xff << 24)) >> 24;
	   }

       destBand1->RasterIO( GF_Write, 0, 0, data->GetXSize(), data->GetYSize(), 
							destWrite1, data->GetXSize(), data->GetYSize(), GDT_Byte, 0, 0 );    

       destBand2->RasterIO( GF_Write, 0, 0, data->GetXSize(), data->GetYSize(), 
							destWrite2, data->GetXSize(), data->GetYSize(), GDT_Byte, 0, 0 );    

       destBand3->RasterIO( GF_Write, 0, 0, data->GetXSize(), data->GetYSize(), 
							destWrite3, data->GetXSize(), data->GetYSize(), GDT_Byte, 0, 0 );    

      // destBand4->RasterIO( GF_Write, 0, 0, data->GetXSize(), data->GetYSize(), 
		//					destWrite4, data->GetXSize(), data->GetYSize(), GDT_Byte, 0, 0 );    


       
       

		/*std::map<float, unsigned int>::iterator it; 
		std::cout << "Counter: \n"; 
	   for(it=counter.begin(); it!=counter.end(); it++){
		 std::cout << (it->first*1000) << " = " << it->second << "\n"; 
	   }*/
       
       /* Once we're done, close properly the dataset */
		if( dest != NULL ){
		
		 	GDALClose(dest );
			GDALClose(poDataset );
		}
	
       /*
       unsigned int *buffer; 
       buffer = (unsigned int *) CPLMalloc(sizeof(unsigned int)*size);
       data->RasterIO(GF_Read, 0, 0, size, 1, buffer, size, 1, GDT_UInt32, 0, 0 );
       
       unsigned int i;
       std::map<unsigned int, unsigned int> counter;  
       for(i=0; i<size; i++){
			counter[buffer[i]]++; 
	   }

		std::map<unsigned int, unsigned int>::iterator it; 
		std::cout << "Counter: \n"; 
	   for(it=counter.begin(); it!=counter.end(); it++){
		 std::cout << it->first << " = " << it->second << "\n"; 
		    
	   }*/
              
    }
    
    exit(0); 
}


void printDataType(GDALDataType type){

		switch(type){
			case GDT_Byte: 
				std::cout << "Type: Byte\n"; 	
				break;
				
			case GDT_UInt16: 
				std::cout << "Type: Uint16\n"; 	
				break;
				
			case GDT_Int16: 
				std::cout << "Type: Int16\n"; 	
				break;
				
			case GDT_UInt32: 
				std::cout << "Type: Uint32\n"; 	
				break;
				
			case GDT_Int32: 
				std::cout << "Type: Int32\n"; 	
				break;
				
			case GDT_Float32: 
				std::cout << "Type: Float32\n"; 	
				break;
				
			case GDT_Float64: 
				std::cout << "Type: Float64\n"; 	
				break;
				
			case GDT_CInt16: 
				std::cout << "Type: CInt16\n"; 	
				break;
				
			case GDT_CInt32: 
				std::cout << "Type: Cint32\n"; 	
				break;
				
			case GDT_CFloat32: 
				std::cout << "Type: CFloat32\n"; 	
				break;
				
			case GDT_CFloat64: 
				std::cout << "Type: CFloat64\n"; 	
				break; 
				
			case GDT_Unknown: 
			default:
				std::cout << "Type: Unknown\n"; 
		}
	
}


